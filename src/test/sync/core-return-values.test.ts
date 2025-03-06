import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { ErrorResponse } from '../../types/ErrorResponse.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('sync - core - return values', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	const execute = async (code: string): Promise<OkResponse | ErrorResponse> => {
		return await runtime.runSandboxed(async ({ evalCode }) => evalCode(code))
	}

	it('returns string', async () => {
		const code = `
    export default 'some valid code'
    `

		const result = (await execute(code)) as OkResponse
		expect(result).toStrictEqual({
			ok: true,
			data: 'some valid code',
		})
	})

	it('returns number', async () => {
		const code = `
    export default 42
    `

		const result = (await execute(code)) as OkResponse
		expect(result).toStrictEqual({
			ok: true,
			data: 42,
		})
	})

	it('returns undefined', async () => {
		const code = `
    export default undefined
    `

		const result = (await execute(code)) as OkResponse
		expect(result).toStrictEqual({
			ok: true,
			data: undefined,
		})
	})

	it('returns true', async () => {
		const code = `
    export default true
    `

		const result = (await execute(code)) as OkResponse
		expect(result).toStrictEqual({
			ok: true,
			data: true,
		})
	})

	it('returns false', async () => {
		const code = `
    export default false
    `

		const result = (await execute(code)) as OkResponse
		expect(result).toStrictEqual({
			ok: true,
			data: false,
		})
	})

	it('returns null', async () => {
		const code = `
    export default null
    `

		const result = (await execute(code)) as OkResponse
		expect(result).toStrictEqual({
			ok: true,
			data: null,
		})
	})

	it('returns object', async () => {
		const code = `
    export default {
      stringValue: 'Hello',
      numberValue: 42,
      trueValue: true,
      falseValue: false,
      undefined: undefined,
      nullValue: null,
      nestedObject: {
        value: true
      },
    }
    `

		const result = (await execute(code)) as OkResponse
		expect(result).toStrictEqual({
			ok: true,
			data: {
				stringValue: 'Hello',
				numberValue: 42,
				trueValue: true,
				falseValue: false,
				undefined: undefined,
				nullValue: null,
				nestedObject: {
					value: true,
				},
			},
		})
	})

	it('returns a function', async () => {
		const code = `
    export default () => 'hello world'
    `

		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			const res = (await evalCode(code)) as OkResponse<() => string>

			const y = res.data
			return y()
		})

		expect(result).toEqual('hello world')
	})

	it('returns an error', async () => {
		const code = `
    export default new Error('error')
    `

		const result = (await runtime.runSandboxed(async ({ evalCode }) => evalCode(code))) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toEqual(new Error('error'))
	})

	it('throws an error', async () => {
		const code = `
      throw new Error('custom error')
    export default 'x'
    `

		const result = (await runtime.runSandboxed(async ({ evalCode }) => evalCode(code))) as ErrorResponse
		expect(result.ok).toBeFalse()
		expect(result.error.message).toEqual('custom error')
		expect(result.error.name).toEqual('Error')
	})
})
