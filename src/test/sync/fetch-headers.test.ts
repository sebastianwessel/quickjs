import { describe, expect, it, mock } from 'bun:test'
import variant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('sync - fetch headers', () => {
	it('supports Headers API on fetch response', async () => {
		const runtime = await loadQuickJs(variant)

		const originalFetch = global.fetch
		global.fetch = Object.assign(
			mock().mockResolvedValue(
				new Response('ok', {
					status: 200,
					statusText: 'OK',
					headers: {
						'Content-Type': 'application/json',
						'X-Test': 'yes',
					},
				}),
			),
			{ preconnect: async () => {} },
		)

		try {
			const result = await runtime.runSandboxed(
				async ({ evalCode }) =>
					evalCode(`
          async function fn() {
            const res = await fetch('https://example.com')
            return {
              isHeaders: res.headers instanceof Headers,
              contentType: res.headers.get('content-type'),
              hasXTest: res.headers.has('x-test'),
            }
          }
          export default await fn()
        `),
				{ allowFetch: true },
			)

			expect(result.ok).toBeTrue()
			const data = (result as OkResponse).data as {
				isHeaders: boolean
				contentType: string | null
				hasXTest: boolean
			}
			expect(data.isHeaders).toBeTrue()
			expect(data.contentType).toBe('application/json')
			expect(data.hasXTest).toBeTrue()
		} finally {
			global.fetch = originalFetch
		}
	})
})
