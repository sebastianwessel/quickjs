import { beforeAll, describe, expect, it } from 'bun:test'
import variant from '@jitl/quickjs-ng-wasmfile-release-asyncify'
import { loadAsyncQuickJs } from '../../loadAsyncQuickJs.js'
import type { ErrorResponse } from '../../types/ErrorResponse.js'

describe('async - core - timeout', () => {
	let runtime: Awaited<ReturnType<typeof loadAsyncQuickJs>>

	beforeAll(async () => {
		runtime = await loadAsyncQuickJs(variant)
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

		const result = await runCode(code, { executionTimeout: 1 })

		expect(result.ok).toBeFalse()
		expect((result as ErrorResponse).error.name).toBe('ExecutionTimeout')
	})
})
