import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../loadQuickJs.js'
import type { OkResponse } from '../types/OkResponse.js'

type AssetCheck = { success: boolean; error: Error | string }

describe('node:assert', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	const runCode = async (code: string): Promise<OkResponse<AssetCheck>> => {
		return await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse<AssetCheck>
		})
	}

	it('assert.ok should pass for truthy values', async () => {
		const code = `
			import assert from 'node:assert'

			let result
			try {
				assert.ok(true, 'True should be truthy')
				result = { success: true }
			} catch (error) {
				result = { success: false, error: error.message }
			}

			export default result
		`

		const result = await runCode(code)
		expect(result.data.success).toBeTrue()
	})

	it('assert.ok should fail for falsy values', async () => {
		const code = `
			import assert from 'node:assert'

			let result
			try {
				assert.ok(false, 'False should be falsy')
				result = { success: true }
			} catch (error) {
				result = { success: false, error: error.message }
			}

			export default result
		`

		const result = await runCode(code)
		expect(result.data.success).toBeFalse()
		expect(result.data.error).toBe('False should be falsy')
	})

	it('assert.equal should pass for equal values', async () => {
		const code = `
			import assert from 'node:assert'

			let result
			try {
				assert.equal(1, 1, '1 should equal 1')
				result = { success: true }
			} catch (error) {
				result = { success: false, error: error.message }
			}

			export default result
		`

		const result = await runCode(code)
		expect(result.data.success).toBeTrue()
	})

	it('assert.equal should fail for non-equal values', async () => {
		const code = `
			import assert from 'node:assert'

			let result
			try {
				assert.equal(1, 2, '1 should not equal 2')
				result = { success: true }
			} catch (error) {
				result = { success: false, error: error.message }
			}

			export default result
		`

		const result = await runCode(code)
		expect(result.data.success).toBeFalse()
		expect(result.data.error).toBe('1 should not equal 2')
	})

	it('assert.deepEqual should pass for deeply equal objects', async () => {
		const code = `
			import assert from 'node:assert'

			let result
			try {
				assert.deepEqual({ a: 1 }, { a: 1 }, 'Objects should be deeply equal')
				result = { success: true }
			} catch (error) {
				result = { success: false, error: error.message }
			}

			export default result
		`

		const result = await runCode(code)
		expect(result.data.success).toBeTrue()
	})

	it('assert.deepEqual should fail for non-deeply equal objects', async () => {
		const code = `
			import assert from 'node:assert'

			let result
			try {
				assert.deepEqual({ a: 1 }, { a: 2 }, 'Objects should not be deeply equal')
				result = { success: true }
			} catch (error) {
				result = { success: false, error: error.message }
			}

			export default result
		`

		const result = await runCode(code)
		expect(result.data.success).toBeFalse()
		expect(result.data.error).toBe('Objects should not be deeply equal')
	})

	it('assert.strictEqual should pass for strictly equal values', async () => {
		const code = `
			import assert from 'node:assert'

			let result
			try {
				assert.strictEqual(1, 1, '1 should strictly equal 1')
				result = { success: true }
			} catch (error) {
				result = { success: false, error: error.message }
			}

			export default result
		`

		const result = await runCode(code)
		expect(result.data.success).toBeTrue()
	})

	it('assert.strictEqual should fail for non-strictly equal values', async () => {
		const code = `
			import assert from 'node:assert'

			let result
			try {
				assert.strictEqual(1, '1', '1 should not strictly equal "1"')
				result = { success: true }
			} catch (error) {
				result = { success: false, error: error.message }
			}

			export default result
		`

		const result = await runCode(code)
		expect(result.data.success).toBeFalse()
		expect(result.data.error).toBe('1 should not strictly equal "1"')
	})
})
