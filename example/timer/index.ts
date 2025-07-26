import variant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadQuickJs, type SandboxOptions } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs(variant)

const options: SandboxOptions = {
	allowFetch: true, // inject fetch and allow the code to fetch data
	allowFs: true, // mount a virtual file system and provide node:fs module
	env: {
		MY_ENV_VAR: 'env var value',
	},
}

const code = `

const t = 5_000

setInterval(()=> console.log('interval') , 500)

setTimeout(() => {
  // never executed
	console.log('timeout')
}, t*2)

export default await new Promise((resolve) => setTimeout(() => resolve('ok'), t))
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result)

await new Promise(() => {})
