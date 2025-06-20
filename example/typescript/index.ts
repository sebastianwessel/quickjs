import { loadQuickJs, type SandboxOptions } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs()

const options: SandboxOptions = {
	// enable typescript transpile
	// typescript must be installed as peer dependency in the project
	transformTypescript: true,
	mountFs: {
		src: {
			'custom.ts': 'export const custom = (input:string):string => input',
		},
	},
}

const code = `
import { join } from 'path'
import { custom } from './custom.js'

const example = (input: string):string => input
  
export default { fn: example('Hello World'), custom: custom('Custom string') }
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result)
