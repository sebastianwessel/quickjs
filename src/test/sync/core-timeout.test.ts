import { beforeAll, describe, expect, it } from 'bun:test'
import variant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadQuickJs } from '../../loadQuickJs.js'

describe('sync - core - timeout', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs(variant)
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
