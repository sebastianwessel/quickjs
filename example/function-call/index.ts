import { type SandboxOptions, loadQuickJs } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs()

const options: SandboxOptions = {}

const code = `

globalThis.total = 0

const sum = (input) => {
  globalThis.total = total + input
  return total
}
  
export default sum
`

const result = await runSandboxed(async ({ evalCode }) => {
	const result = await evalCode(code, undefined, options)
	if (!result.ok) {
		console.error(result)
		throw new Error('Failed to evaluate code')
	}
	const fn = result.data as (input: number) => Promise<number>

	for (let index = 0; index < 10; index++) {
		const total = await fn(index)
		console.log(index, total)
	}

	return 'DONE'
}, options)

console.log(result)
