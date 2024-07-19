import { quickJS } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { createRuntime } = await quickJS()

// Create a runtime instance each time a js code should be executed
const { evalCode } = await createRuntime({
	allowFetch: true, // inject fetch and allow the code to fetch data
	allowFs: true, // mount a virtual file system and provide node:fs module
	env: {
		MY_ENV_VAR: 'env var value',
	},
	enableTestUtils: true,
})

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

const result = await evalCode(code)

console.log(JSON.stringify(result, null, 2))
