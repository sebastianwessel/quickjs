import { type SandboxOptions, loadQuickJs } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs()

const options: SandboxOptions = {
	allowFetch: true, // inject fetch and allow the code to fetch data
	allowFs: true, // mount a virtual file system and provide node:fs module
	env: {
		MY_ENV_VAR: 'env var value',
	},
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

const result = await runSandboxed(async ({ evalCode }) => evalCode(code, undefined, options), options)

console.log(result) // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
