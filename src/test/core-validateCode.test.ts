import { describe, expect, it } from 'bun:test'
import { quickJS } from '../quickJS.js'
import type { ErrorResponse } from '../types/ErrorResponse.ts'
import type { OkResponseCheck } from '../types/OkResponseCheck.js'

describe('core - validateCode', () => {
	it('returns ok true when the code is valid', async () => {
		const { createRuntime } = await quickJS()
		const { validateCode } = await createRuntime()

		const code = `
    const value ='some valid code'
      export default value
    `

		const result = (await validateCode(code)) as OkResponseCheck
		expect(result).toStrictEqual({
			ok: true,
		})
	})

	it('returns ok false and the error when the code is valid', async () => {
		const { createRuntime } = await quickJS()
		const { validateCode } = await createRuntime()

		const code = `
    const value ='missing string end
      export default value
    `

		const result = (await validateCode(code)) as ErrorResponse
		expect(result).toStrictEqual({
			ok: false,
			error: {
				message: 'unexpected end of string',
				name: 'SyntaxError',
				stack: '    at /src/index.js:2:1\n',
			},
			isSyntaxError: true,
		})
	})
})
