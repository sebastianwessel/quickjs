import { join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { quickJS } from '@sebastianwessel/quickjs'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { createRuntime } = await quickJS()

const __dirname = dirname(fileURLToPath(import.meta.url))
const customModuleHostLocation = join(__dirname, './custom.js')

// Create a runtime instance each time a js code should be executed
const { evalCode } = await createRuntime({
	nodeModules: {
		// module name
		'custom-module': {
			// key must be index.js, value file content of module
			'index.js': await Bun.file(customModuleHostLocation).text(),
		},
	},
})

const result = await evalCode(`
import { customFn } from 'custom-module'

const result = customFn()

console.log(result)
  
export default result
`)

console.log(result) // { ok: true, data: 'Hello from the custom module' }
