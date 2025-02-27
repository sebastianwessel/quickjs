import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('core - timeout', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	const runCode = async (code: string, options: { executionTimeout?: number } = {}): Promise<OkResponse> => {
		return await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)
	}

	it('terminates execution when global timeout is reached', async () => {
		const code = `
    while(true){}  
    export default 'ok'
    `

		const result = await runCode(code, { executionTimeout: 1 })
		expect(result.ok).toBeFalse()
		expect(result.data).toBeUndefined()
	})

	it('terminates execution when evalCode timeout is reached', async () => {
		const code = `
    while(true){}  
    export default 'ok'
    `

		const result = await runCode(code, { executionTimeout: 1 })
		expect(result.ok).toBeFalse()
		expect(result.data).toBeUndefined()
	})
})
