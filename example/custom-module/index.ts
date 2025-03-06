import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type SandboxOptions, loadQuickJs } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs()

const __dirname = dirname(fileURLToPath(import.meta.url))
const customModuleHostLocation = join(__dirname, './custom-module.js')

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
			'custom-relative.js': `
        import { test } from './lib/sub-import.js'
        export const relativeImportFunction = ()=>test()
      `,
			lib: {
				'sub-import.js': `export const test = ()=>'Hello from relative import function'`,
			},
		},
		'text.txt': 'Some text file',
	},
	allowFs: true,
}

const code = `
import { readFileSync } from 'node:fs'
import { customFn } from 'custom-module'

// the current code is virtual the file /src/index.js.
// relative imports are relative to the current file location
import { relativeImportFunction } from './custom-relative.js'

const customModule = customFn()
console.log('customModule:', customModule)

const relativeImport = relativeImportFunction()
console.log('relativeImport:', relativeImport)

// node:fs is relative to cwd which is / = the root of the file system
const fileContent = readFileSync('text.txt', 'utf8')
  
export default { customModule, relativeImport, fileContent, cwd: process.cwd() }
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result) // { ok: true, data: 'Hello from the custom module' }
