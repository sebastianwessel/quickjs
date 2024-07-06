import { describe, expect, it } from 'bun:test'
import { quickJS } from '../quickJS.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('core - timers', () => {
	it('setTimeout works correctly', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime()

		const code = `
      export default await new Promise((resolve) => {
        setTimeout(() => {
          resolve('timeout reached')
        }, 1_000)
      })
    `

		const result = (await evalCode(code)) as OkResponse
		expect(result.data).toBe('timeout reached')
	})

	it('clearTimeout works correctly', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime()

		const code = `
      export default await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve('timeout reached')
        }, 60_000)
        clearTimeout(timeout)
        resolve('timeout cleared')
      })
    `

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe('timeout cleared')
	})

	it('setInterval works correctly', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime()

		const code = `
      export default await new Promise((resolve) => {
        let count = 0
        const interval = setInterval(() => {
          count++
          if (count === 3) {
            clearInterval(interval)
            resolve('interval reached')
          }
        }, 10)
      })
    `

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe('interval reached')
	})

	it('clearInterval works correctly', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime()

		const code = `
      export default await new Promise((resolve) => {
        let count = 0
        const interval = setInterval(() => {
          count++
        }, 100)
        setTimeout(() => {
          clearInterval(interval)
          resolve(count)
        }, 500)
      })
    `

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		// The exact count can vary depending on timing precision,
		// but it should be around 3 if intervals are 100ms and we clear after 350ms.
		expect(result.data).toBeGreaterThanOrEqual(3)
		expect(result.data).toBeLessThanOrEqual(5)
	})
})
