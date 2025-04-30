import { describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../loadQuickJs.js'
import type { ErrorResponse } from '../types/ErrorResponse.js'
import type { OkResponse } from '../types/OkResponse.js'
import type { SandboxOptions } from '../types/SandboxOptions.js'

describe('bugfix - #68', () => {
	it('does not crash when async function resolves', async () => {
		const runtime = await loadQuickJs()

		const getExternalData = async (input: string) => {
			return { myValue: input }
		}

		const options: SandboxOptions = {
			allowFetch: false,
			env: {
				getExternalData,
			},
		}

		const code = `
      const fn = async ()=>{
        const data = await env.getExternalData('some-id')
        return data.myValue
      }
        
      export default await fn()
    `

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), options)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe('some-id')
	})

	it('does not crash when async function throws', async () => {
		const runtime = await loadQuickJs('@jitl/quickjs-ng-wasmfile-debug-sync')

		const getExternalData = async (_input: string) => {
			throw new Error('test')
		}

		const options: SandboxOptions = {
			allowFetch: false,
			env: {
				getExternalData,
			},
		}

		const code = `
      const fn = async ()=>{
        const data = await env.getExternalData('some-id')
        return data.myValue
      }
        
      export default await fn()
    `

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), options)
		expect(result.ok).toBeFalse()
		expect((result as ErrorResponse).error.name).toBe('Error')
		expect((result as ErrorResponse).error.message).toBe('test')
	})

	it('maps Error type correctly', async () => {
		const runtime = await loadQuickJs('@jitl/quickjs-ng-wasmfile-debug-sync')

		const getExternalData = async (_input: string) => {
			throw new TypeError('test')
		}

		const options: SandboxOptions = {
			allowFetch: false,
			env: {
				getExternalData,
			},
		}

		const code = `
      const fn = async ()=>{
        const data = await env.getExternalData('some-id')
        return data.myValue
      }
        
      export default await fn()
    `

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), options)
		expect(result.ok).toBeFalse()
		expect((result as ErrorResponse).error.name).toBe('TypeError')
		expect((result as ErrorResponse).error.message).toBe('test')
	})
})
