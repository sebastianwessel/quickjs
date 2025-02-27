import { type SandboxOptions, loadQuickJs } from '../../src/index.js'

const userGeneratedCode = `

console.log('getLastAlert guest', env.getLastAlert())
env.setLastAlert(new Date())
console.log('getLastAlert guest', env.getLastAlert())

return true`

const logFileContent = `{"message":"some log message","errorCode":0,"dateTime":"2025-02-26T07:35:10Z"}
{"message":"an error message","errorCode":1,"dateTime":"2025-02-26T07:40:00Z"}`

let memory: Date = new Date(0)

const options: SandboxOptions = {
	allowFetch: false,
	allowFs: true,
	transformTypescript: true,
	mountFs: {
		'log.jsonl': logFileContent,
		src: {
			'types.ts': `export type LogRow = {
                    message: string
                    errorCode: number
                    dateTime: string
                  }
                  
                  export type AlertDecisionFn = ( input: LogRow[] ) => boolean`,
			'custom.ts': `import type { AlertDecisionFn } from './types.js'

      export const shouldAlert: AlertDecisionFn = (input) => {
      ${userGeneratedCode}
      }`,
		},
	},
	env: {
		setLastAlert: (input: Date) => {
			memory = input
		},
		getLastAlert: () => {
			return memory
		},
	},
}

const { runSandboxed } = await loadQuickJs()

// fixed code (guest:  src/index.ts)
const executionCode = `import { readFileSync } from 'node:fs'

import { shouldAlert } from './custom.js'
import type { LogRow } from './types.js'

const main = () => {

  const logFileContent = readFileSync('log.jsonl', 'utf-8')
  const logs: LogRow[] = logFileContent.split('\\n').map(line => JSON.parse(line))
  
  return shouldAlert(logs)
 }

export default main()
`

const resultSandbox = await runSandboxed(async ({ evalCode }) => {
	return await evalCode(executionCode, undefined, options)
}, options)

console.log(resultSandbox)
