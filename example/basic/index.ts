import { loadQuickJs, type SandboxOptions } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs()

const options: SandboxOptions = {
	allowFetch: true, // inject fetch and allow the code to fetch data
	allowFs: true, // mount a virtual file system and provide node:fs module
	env: {
		MY_ENV_VAR: 'env var value',
	},
}

const code = `
import { join } from 'path'

const fn = async ()=>{
  console.log(join('src','dist')) // logs "src/dist" on host system

  console.log(env.MY_ENV_VAR) // logs "env var value" on host system

  const url = new URL('https://example.com')

  const f = await fetch(url)

  return f.text()
}

const result = await fn()

globalThis.step1 = result
  
export default result
`

const code2 = `

export default 'step 2' + step1
`

const result = await runSandboxed(async ({ evalCode }) => {
	// run first call
	const result = await evalCode(code)

	console.log('step 1', result)

	// run second call
	return evalCode(code2)
}, options)

console.log(result) // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
