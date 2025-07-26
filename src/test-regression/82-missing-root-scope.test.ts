import { describe, expect, it } from 'bun:test'
import variant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadQuickJs } from '../loadQuickJs.js'
import type { ErrorResponse } from '../types/ErrorResponse.js'
import type { SandboxOptions } from '../types/SandboxOptions.js'

describe('bugfix - #82', () => {
	it('handles async env errors without crashing', async () => {
		const runtime = await loadQuickJs(variant)

		const thrower = async (_input: string) => {
			throw new Error('test')
		}

		const options: SandboxOptions = {
			allowFetch: false,
			env: {
				thrower,
			},
		}

		const code = `
      const fn = async ()=>{
        await env.thrower('some-id')
        return true
      }

      export default await fn()
    `

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), options)

		expect(result.ok).toBeFalse()
		expect((result as ErrorResponse).error.name).toBe('Error')
		expect((result as ErrorResponse).error.message).toBe('test')
	})
})
