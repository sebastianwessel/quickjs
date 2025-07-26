import { beforeAll, describe, expect, it } from 'bun:test'
import variant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('sync - node:timers/promises', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs(variant)
	})

	const runCode = async (code: string) => {
		return await runtime.runSandboxed(async ({ evalCode }) => {
			return await evalCode(code)
		})
	}

	it('setTimeout resolves', async () => {
		const code = `
      import { setTimeout } from 'node:timers/promises'
      export default await setTimeout(100, 'done')
    `

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe('done')
	})

	it('setImmediate resolves', async () => {
		const code = `
      import { setImmediate } from 'node:timers/promises'
      export default await setImmediate('immediate')
    `

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe('immediate')
	})
})
