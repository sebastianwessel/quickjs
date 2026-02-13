import { describe, expect, it } from 'bun:test'
import variant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadQuickJs } from '../loadQuickJs.js'
import type { ErrorResponse } from '../types/ErrorResponse.js'

describe('bugfix - #90', () => {
	it('returns a timeout error instead of aborting runtime on async env calls', async () => {
		const runtime = await loadQuickJs(variant)

		const result = await runtime.runSandboxed(
			async ({ evalCode }) =>
				evalCode(`
          async function fn() {
            return env.asyncFn('test')
              .then(r => env.asyncFn(r))
              .then(r => env.asyncFn(r))
              .then(r => env.asyncFn(r))
              .then(r => env.log(r))
          }
          export default await fn()
        `),
			{
				executionTimeout: 100,
				memoryLimit: 1024 * 1024,
				env: {
					log: (_msg: unknown) => {},
					asyncFn: async (..._args: unknown[]) =>
						new Promise(resolve => {
							setTimeout(() => resolve('done'), 100)
						}),
				},
			},
		)

		expect(result.ok).toBeFalse()
		expect((result as ErrorResponse).error.name).toBe('ExecutionTimeout')
	})

	it('does not abort when async host calls are started without awaiting', async () => {
		const runtime = await loadQuickJs(variant)

		const result = await runtime.runSandboxed(
			async ({ evalCode }) =>
				evalCode(`
          env.asyncFn('test')
            .then(r => env.asyncFn(r))
            .then(r => env.asyncFn(r))
            .then(r => env.asyncFn(r))
          export default true
        `),
			{
				env: {
					asyncFn: async (..._args: unknown[]) =>
						new Promise(resolve => {
							setTimeout(() => resolve('done'), 20)
						}),
				},
			},
		)

		expect(result.ok).toBeTrue()
	})
})
