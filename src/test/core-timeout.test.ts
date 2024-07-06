import { describe, expect, it } from 'bun:test'
import { quickJS } from '../quickJS.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('core - timeout', () => {
	it('terminates execution when global timeout is reached', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ executionTimeout: 1 })

		const code = `
      export default await new Promise((resolve)=> setTimeout(()=>resolve('DONE'), 4_000))
    `

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeFalse()
		expect(result.data).toBeUndefined()
	})
})
