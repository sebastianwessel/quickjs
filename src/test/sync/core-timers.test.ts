import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('sync - core - timers', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	const runCode = async (code: string): Promise<OkResponse> => {
		return await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		})
	}

	it('setTimeout works correctly', async () => {
		const code = `
      export default await new Promise((resolve) => {
        setTimeout(() => {
          resolve('timeout reached')
        }, 1_000)
      })
    `

		const result = await runCode(code)
		expect(result.data).toBe('timeout reached')
	})

	it('clearTimeout works correctly', async () => {
		const code = `
      export default await new Promise((resolve,reject) => {
        const timeout = setTimeout(() => {
          reject('timeout reached')
        }, 100)

        clearTimeout(timeout)

        setTimeout(()=>{
         resolve('timeout cleared')
        }, 500)
      })
    `

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe('timeout cleared')
	})

	it('setInterval works correctly', async () => {
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

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe('interval reached')
	})

	it('clearInterval works correctly', async () => {
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

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		// The exact count can vary depending on timing precision,
		// but it should be around 3 if intervals are 100ms and we clear after 500ms.
		expect(result.data).toBeGreaterThanOrEqual(3)
		expect(result.data).toBeLessThanOrEqual(5)
	})
})
