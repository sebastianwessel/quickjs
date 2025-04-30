import { beforeAll, describe, expect, it } from 'bun:test'
import { loadAsyncQuickJs } from '../../loadAsyncQuickJs.js'
import type { ErrorResponse } from '../../types/ErrorResponse.js'
import type { OkResponseCheck } from '../../types/OkResponseCheck.js'

describe('async - core - validateCode', () => {
	let runtime: Awaited<ReturnType<typeof loadAsyncQuickJs>>

	beforeAll(async () => {
		runtime = await loadAsyncQuickJs()
	})

	const runValidation = async (code: string) => {
		return await runtime.runSandboxed(async ({ validateCode }) => {
			return await validateCode(code)
		})
	}

	it('returns ok true when the code is valid', async () => {
		const code = `
    const value = 'some valid code'
    export default value
    `

		const result = (await runValidation(code)) as OkResponseCheck
		expect(result).toStrictEqual({
			ok: true,
		})
	})

	it('returns ok false and the error when the code is invalid', async () => {
		const code = `
    const value = 'missing string end
    export default value
    `

		const result = (await runValidation(code)) as ErrorResponse
		expect(result).toStrictEqual({
			ok: false,
			error: {
				message: 'unexpected end of string',
				name: 'SyntaxError',
				stack: expect.any(String),
			},
			isSyntaxError: true,
		})
	})
})
