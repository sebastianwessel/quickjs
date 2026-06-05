import { beforeAll, describe, expect, it } from 'bun:test'
import asyncVariant from '@jitl/quickjs-ng-wasmfile-release-asyncify'
import syncVariant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadAsyncQuickJs } from '../loadAsyncQuickJs.js'
import { loadQuickJs } from '../loadQuickJs.js'
import type { OkResponse } from '../types/OkResponse.js'

type TestSummary = {
	passed: boolean
	passedSuites: number
	failedSuites: number
	passedTests: number
	failedTests: number
	totalTests: number
	totalSuites: number
}

describe('bugfix - test utils compatibility', () => {
	let syncRuntime: Awaited<ReturnType<typeof loadQuickJs>>
	let asyncRuntime: Awaited<ReturnType<typeof loadAsyncQuickJs>>

	beforeAll(async () => {
		syncRuntime = await loadQuickJs(syncVariant)
		asyncRuntime = await loadAsyncQuickJs(asyncVariant)
	})

	const code = `
		import 'test'

		describe('mocha', () => {
			it('runs chai assertions inside the sandbox', () => {
				expect(true).to.be.true
			})
		})

		export default await runTests()
	`

	const cases = [
		{
			name: 'sync',
			run: async () => syncRuntime.runSandboxed(async ({ evalCode }) => evalCode(code), { enableTestUtils: true }),
		},
		{
			name: 'async',
			run: async () => asyncRuntime.runSandboxed(async ({ evalCode }) => evalCode(code), { enableTestUtils: true }),
		},
	]

	for (const runtimeCase of cases) {
		it(`${runtimeCase.name} loads bundled test helpers`, async () => {
			const result = (await runtimeCase.run()) as OkResponse

			expect(result.ok).toBeTrue()
			const data = result.data as TestSummary
			expect(data.passed).toBeTrue()
			expect(data.passedSuites).toBe(1)
			expect(data.failedSuites).toBe(0)
			expect(data.passedTests).toBe(1)
			expect(data.failedTests).toBe(0)
			expect(data.totalTests).toBe(1)
			expect(data.totalSuites).toBe(1)
		})
	}
})
