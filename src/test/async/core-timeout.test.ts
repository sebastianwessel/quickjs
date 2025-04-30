import { beforeAll, describe, expect, it } from 'bun:test'
import { loadAsyncQuickJs } from '../../loadAsyncQuickJs.js'

describe('async - core - timeout', () => {
	let runtime: Awaited<ReturnType<typeof loadAsyncQuickJs>>

	beforeAll(async () => {
		runtime = await loadAsyncQuickJs()
	})

	const runCode = async (code: string, options: { executionTimeout?: number } = {}) => {
		return await runtime.runSandboxed(async ({ evalCode }) => {
			return await evalCode(code)
		}, options)
	}

	it('terminates execution when global timeout is reached', async () => {
		const code = `
    while(true){}  
    export default 'ok'
    `

		await expect(runCode(code, { executionTimeout: 1 })).rejects.toThrow('interrupted')
	})
})
