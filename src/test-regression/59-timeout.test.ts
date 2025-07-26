import { describe, expect, it } from 'bun:test'
import variant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadQuickJs } from '../loadQuickJs.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('bugfix - #59', () => {
	it('does not throw when setTimeout is called with one argument', async () => {
		const runtime = await loadQuickJs(variant)

		const code = `
      export default await new Promise((resolve) => setTimeout(()=>resolve(true)))
    `

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code))
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBeTrue()
	})
})
