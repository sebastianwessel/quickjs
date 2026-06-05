import { beforeAll, describe, expect, it } from 'bun:test'
import asyncVariant from '@jitl/quickjs-ng-wasmfile-release-asyncify'
import syncVariant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadAsyncQuickJs } from '../loadAsyncQuickJs.js'
import { loadQuickJs } from '../loadQuickJs.js'
import type { ErrorResponse } from '../types/ErrorResponse.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('bugfix - timer bridge', () => {
	let syncRuntime: Awaited<ReturnType<typeof loadQuickJs>>
	let asyncRuntime: Awaited<ReturnType<typeof loadAsyncQuickJs>>

	beforeAll(async () => {
		syncRuntime = await loadQuickJs(syncVariant)
		asyncRuntime = await loadAsyncQuickJs(asyncVariant)
	})

	const cases = [
		{
			name: 'sync',
			run: async (code: string, options = {}) =>
				syncRuntime.runSandboxed(async ({ evalCode }) => evalCode(code), options),
		},
		{
			name: 'async',
			run: async (code: string, options = {}) =>
				asyncRuntime.runSandboxed(async ({ evalCode }) => evalCode(code), options),
		},
	]

	for (const runtimeCase of cases) {
		it(`${runtimeCase.name} forwards timer callback arguments`, async () => {
			const result = (await runtimeCase.run(`
				export default await new Promise(resolve => {
					setTimeout((first, second) => {
						resolve([first, second])
					}, 1, 'first', 2)
				})
			`)) as OkResponse

			expect(result.ok).toBeTrue()
			expect(result.data).toEqual(['first', 2])
		})

		it(`${runtimeCase.name} enforces setImmediate concurrency limits`, async () => {
			const result = (await runtimeCase.run(
				`
					setImmediate(() => {})
					setImmediate(() => {})
					export default 'unreachable'
				`,
				{ maxTimeoutCount: 1 },
			)) as ErrorResponse

			expect(result.ok).toBeFalse()
			expect(result.error.name).toBe('Error')
			expect(result.error.message).toContain('setImmediate')
		})
	}
})
