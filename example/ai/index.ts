import OpenAI from 'openai'
import { type SandboxOptions, loadQuickJs } from '../../src/index.js'

// The user instruction
const USER_INSTRUCTION = 'I need the content of the title tag from https://purista.dev'

// Set the LLM - here, Ollama with model Qwen 2.5 7b is used
const OPENAI_API_KEY = process.env['OPENAI_API_KEY'] ?? ''
const OPENAI_API_BASE = process.env['OPENAI_API_BASE'] ?? 'http://localhost:11434/v1'
const MODEL = 'qwen2.5-coder:7b' //'gpt-4o'

const client = new OpenAI({
	apiKey: OPENAI_API_KEY,
	baseURL: OPENAI_API_BASE,
})

const promptTemplate = `
Your task is to implement a function in javascript for the user instruction.

<instruction>
%INSTRUCTION%
</instruction>

Implementation details:
- you are in a Node.JS environment
- use ESM syntax with import statements
- use only native node packages
- never use external packages
- the generated code must return the result with with default export
- when a promise is returned via export default it must be explicit awaited
- you can use the native fetch function

Return only the javascript code without any thoughts or additional text. Always Return only as plain text. Do not use backticks or any format.


Example:
\`\`\`ts
async myFunction()=> {
  const res = await fetch('https://example.com')
  if(!res.ok) {
    throw new Error('Failed to fetch example.com')
  }
  return res.json()
}

export default await myFunction()
\`\`\`

`

console.log('Generating code')

const chatCompletion = await client.chat.completions.create({
	messages: [{ role: 'user', content: promptTemplate.replace('%INSTRUCTION%', USER_INSTRUCTION) }],
	model: MODEL,
})

const code = chatCompletion.choices[0].message.content?.replace(/^```[a-zA-Z]*\n?|```$/g, '')

if (!code) {
	throw new Error('Failed to generate code')
}

const { runSandboxed } = await loadQuickJs()

const options: SandboxOptions = {
	allowFetch: true, // inject fetch and allow the code to fetch data
	allowFs: true, // mount a virtual file system and provide node:fs module
}

const resultSandbox = await runSandboxed(async ({ evalCode }) => {
	console.log('Executing code')
	return await evalCode(code, undefined, options)
}, options)

let resultText = ''

if (!resultSandbox.ok) {
	console.log('code', code)
	console.log()
	console.log('Code execution failed', resultSandbox.error)
	resultText = `The code execution failed with error ${resultSandbox.error.message}`
} else {
	console.log('Code execution result', resultSandbox.data)
	resultText = `The code execution was successful.
<result>
${resultSandbox.data}
</result>
  `
}

console.log('Generating final answer')

const finalChatCompletion = await client.chat.completions.create({
	messages: [
		{
			role: 'user',
			content: `You task to create ab answer based on the the following actions.

## Action 1
The user has provided the following instruction:

<instruction>
${USER_INSTRUCTION}
<instruction>

## Action 2
An AI has generated a javascript code, based on the users instruction.

## Action 3
The generated javascript code was executed.
${resultText}

Give a friendly answer to the user, based on the actions.
`,
		},
	],
	model: MODEL,
})

console.log('======== Final Answer ========')
console.log('')
console.log(finalChatCompletion.choices[0].message.content)
