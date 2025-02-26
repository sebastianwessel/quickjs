---
title: Execute AI Generated Code
description: Use QuickJS to run ai generated code in a sandbox fast and secure
order: 10
---

# Execute AI-Generated Code

With the rise of AI-generated code, a whole new world of possibilities has opened up.

The logical next step is to execute the generated code just in time. This brings up several important considerations:

- Executing generated code requires a runtime environment.
- The environment should be temporary.
- The environment should be instantly available.
- The generated code might not work as expected.
- The generated code might contain potentially dangerous operations.
- _[...]_

Here, some kind of virtual environment is the most logical solution. In general, there are several options to choose from, each with its own pros and cons.

## WebAssembly-Based QuickJS

Choosing an approach based on QuickJS running as WebAssembly has the benefit of requiring very little overhead. Additionally, this approach can be used both in the backend and the frontend. Moreover, the cold start time is very low compared to solutions that require booting Docker containers or similar environments.

The main drawback is that it does not provide a fully featured environment equivalent to a regular Node.js runtime. Furthermore, handling dependencies may not be straightforward, especially in fully autonomous scenarios.

However, even with a limited set of functionalities, impressive use cases are possible.

## Example

To illustrate the general idea, let's start by creating an LLM prompt.

### LLM Prompt

In the LLM prompt, we need to specify the user's intention as well as provide some guidelines for the expected output.

Here is a simple prompt that includes a placeholder `%INSTRUCTION%` for the user's intention:

```md
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

Return plain javascript code as plain text, without any thoughts or additional text. Return as plain text without backticks.
```

Here is an example output, generated with _Qwen Coder 2.5 7b_, running local with Ollama.

The user instruction: _"I need the title tag from https://purista.dev"_

The generated code:

```js
async function getTitleTag() {
  const res = await fetch('https://purista.dev');
  if (!res.ok) {
    throw new Error('Failed to fetch purista.dev');
  }
  const html = await res.text();
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1];
  } else {
    throw new Error('Title tag not found');
  }
}

export default await getTitleTag()
```

### Executing The Code

It is straight forward to pass the generated code into the QuickJS runtime.

```ts
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const code = '...' // the AI generated code

const { runSandboxed } = await loadQuickJs()

const options: SandboxOptions = {
  allowFetch: true, // inject fetch and allow the code to fetch data
}

const result = await runSandboxed(async ({ evalCode }) => {
  const evalResult = await evalCode(code, undefined, options)

  console.log('evalCode result', evalResult)
  return evalResult
})

```

### Combining the steps

In a more realistic scenario, you would have the following steps:

1. get the users input
2. the AI code generation
3. the code execution
4. creation of a propper response, based on previous steps

### Full example

Here is the full showcase example. It can be found in the `example/ai` folder of the repository.

When you start experimenting, you might notice that sometimes the generated code does not fulfill the requirements, and the execution fails. Furthermore, you can see that there is already a simple regex in place, which ensures that any potential markdown backticks are removed before the code is executed, improving robustness.

A good improvement here would be to add a retry mechanism for the generation and execution steps. The error returned by the execution step could be used to regenerate the code with fixes.

Depending on the actual needs, you might need to choose a more powerful model for code generation, and/or adding some planning steps.

<<< @/../example/ai/index.ts

## Conclusion

As demonstrated in this example, the QuickJS library makes it easy to provide a sandboxed environment for executing AI-generated code without requiring a complex infrastructure.

From a security perspective, this approach is also highly advantageous, as the WebAssembly container inherently mitigates many potential security risks.

Most importantly, with this approach, the result returned by the LLM is based on regular computation. This means that by adding information that is reproducible and verifiable, we prevent the LLM from making guesses or assumptions.

This is the best way to prevent LLM hallucinations and make the system trustworthy.
