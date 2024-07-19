import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type SandboxOptions, loadQuickJs } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs()

const __dirname = dirname(fileURLToPath(import.meta.url))
const customModuleHostLocation = join(__dirname, './custom.js')

const options: SandboxOptions = {
	nodeModules: {
		// module name
		'custom-module': {
			// key must be index.js, value file content of module
			'index.js': await Bun.file(customModuleHostLocation).text(),
		},
	},
	mountFs: {
		src: {
			'custom.js': `export const relativeImportFunction = ()=>'Hello from relative import function'`,
		},
	},
}

const code = `
import { customFn } from 'custom-module'
import { relativeImportFunction } from './custom.js'

const customModule = customFn()
console.log('customModule:', customModule)

const relativeImport = relativeImportFunction()
console.log('relativeImport:', relativeImport)
  
export default { customModule, relativeImport }
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code, undefined, options), options)

console.log(result) // { ok: true, data: 'Hello from the custom module' }
