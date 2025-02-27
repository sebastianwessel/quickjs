import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('node:util - base', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	const runCode = async (code: string): Promise<OkResponse> => {
		return await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		})
	}

	it('promisify works correctly', async () => {
		const code = `
			function callbackFunction(arg, callback) {
        if (arg === 'error') {
          callback(new Error('Test error'))
        } else {
          callback(null, 'Test success')
        }
			}

			import { promisify } from 'node:util'
			const promiseFunction = promisify(callbackFunction)

			async function testPromisify() {
				const successResult = await promiseFunction('success')
				if (successResult !== 'Test success') {
					throw new Error('Promisify test failed for success case')
				}

				try {
					await promiseFunction('error')
				} catch (error) {
					if (error.message !== 'Test error') {
						throw new Error('Promisify test failed for error case')
					}
				}

				return 'Test passed'
			}

			export default await testPromisify()
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe('Test passed')
	})

	it('callbackify works correctly', async () => {
		const code = `
			async function asyncFunction(arg) {
				if (arg === 'error') {
					throw new Error('Test error')
				} else {
					return 'Test success'
				}
			}

			import { callbackify } from 'node:util'
			const callbackFunction = callbackify(asyncFunction)

			function testCallbackify() {
				return new Promise((resolve, reject) => {
					callbackFunction('success', (err, result) => {
						if (err || result !== 'Test success') {
							reject(new Error('Callbackify test failed for success case'))
						} else {
							callbackFunction('error', (err, result) => {
								if (!err || err.message !== 'Test error') {
									reject(new Error('Callbackify test failed for error case'))
								} else {
									resolve('Test passed')
								}
							})
						}
					})
				})
			}

			export default await testCallbackify()
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe('Test passed')
	})
})
