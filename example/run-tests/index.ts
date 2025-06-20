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
	enableTestUtils: true,
}

const code = `
import 'test'

describe('mocha', ()=> {
  it('should work',()=>{
   expect(true).to.be.true
  })
})

const testResult = await runTests();

export default testResult
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(JSON.stringify(result, null, 2))
