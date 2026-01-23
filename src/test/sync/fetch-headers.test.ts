import { beforeAll, describe, expect, it, mock } from 'bun:test'
import variant from '@jitl/quickjs-ng-wasmfile-release-sync'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('sync - fetch headers', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs(variant)
	})

	it('headers should be an instance of Headers', async () => {
		// Mock fetch to return predictable headers
		const originalFetch = global.fetch
		global.fetch = Object.assign(
			mock().mockResolvedValue(
				new Response('test', {
					status: 200,
					statusText: 'OK',
					headers: {
						'Content-Type': 'text/plain',
						'X-Custom-Header': 'custom-value',
					},
				}),
			),
			{ preconnect: async () => {} },
		)

		try {
			const code = `
				async function fn() {
					const res = await fetch('http://example.com')
					return {
						isHeadersInstance: res.headers instanceof Headers,
						hasGetMethod: typeof res.headers.get === 'function',
						hasHasMethod: typeof res.headers.has === 'function',
					}
				}
				export default await fn()
			`

			const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
				allowFetch: true,
			})

			expect(result.ok).toBeTrue()
			const data = (result as OkResponse).data as { isHeadersInstance: boolean; hasGetMethod: boolean; hasHasMethod: boolean }
			expect(data.isHeadersInstance).toBeTrue()
			expect(data.hasGetMethod).toBeTrue()
			expect(data.hasHasMethod).toBeTrue()
		} finally {
			global.fetch = originalFetch
		}
	})

	it('headers.get() should return correct values', async () => {
		const originalFetch = global.fetch
		global.fetch = Object.assign(
			mock().mockResolvedValue(
				new Response('test', {
					status: 200,
					statusText: 'OK',
					headers: {
						'Content-Type': 'application/json',
						'X-Custom-Header': 'my-value',
					},
				}),
			),
			{ preconnect: async () => {} },
		)

		try {
			const code = `
				async function fn() {
					const res = await fetch('http://example.com')
					return {
						contentType: res.headers.get('Content-Type'),
						customHeader: res.headers.get('X-Custom-Header'),
						missingHeader: res.headers.get('X-Missing'),
					}
				}
				export default await fn()
			`

			const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
				allowFetch: true,
			})

			expect(result.ok).toBeTrue()
			const data = (result as OkResponse).data as { contentType: string; customHeader: string; missingHeader: string | null }
			expect(data.contentType).toBe('application/json')
			expect(data.customHeader).toBe('my-value')
			expect(data.missingHeader).toBeNull()
		} finally {
			global.fetch = originalFetch
		}
	})

	it('headers.has() should check header existence', async () => {
		const originalFetch = global.fetch
		global.fetch = Object.assign(
			mock().mockResolvedValue(
				new Response('test', {
					status: 200,
					statusText: 'OK',
					headers: {
						'Content-Type': 'text/html',
					},
				}),
			),
			{ preconnect: async () => {} },
		)

		try {
			const code = `
				async function fn() {
					const res = await fetch('http://example.com')
					return {
						hasContentType: res.headers.has('Content-Type'),
						hasMissing: res.headers.has('X-Missing'),
					}
				}
				export default await fn()
			`

			const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
				allowFetch: true,
			})

			expect(result.ok).toBeTrue()
			const data = (result as OkResponse).data as { hasContentType: boolean; hasMissing: boolean }
			expect(data.hasContentType).toBeTrue()
			expect(data.hasMissing).toBeFalse()
		} finally {
			global.fetch = originalFetch
		}
	})

	it('headers.get() should be case-insensitive', async () => {
		const originalFetch = global.fetch
		global.fetch = Object.assign(
			mock().mockResolvedValue(
				new Response('test', {
					status: 200,
					statusText: 'OK',
					headers: {
						'Content-Type': 'text/plain',
					},
				}),
			),
			{ preconnect: async () => {} },
		)

		try {
			const code = `
				async function fn() {
					const res = await fetch('http://example.com')
					return {
						lowercase: res.headers.get('content-type'),
						uppercase: res.headers.get('CONTENT-TYPE'),
						mixedCase: res.headers.get('Content-Type'),
					}
				}
				export default await fn()
			`

			const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
				allowFetch: true,
			})

			expect(result.ok).toBeTrue()
			const data = (result as OkResponse).data as { lowercase: string; uppercase: string; mixedCase: string }
			expect(data.lowercase).toBe('text/plain')
			expect(data.uppercase).toBe('text/plain')
			expect(data.mixedCase).toBe('text/plain')
		} finally {
			global.fetch = originalFetch
		}
	})

	it('headers should be iterable with forEach', async () => {
		const originalFetch = global.fetch
		global.fetch = Object.assign(
			mock().mockResolvedValue(
				new Response('test', {
					status: 200,
					statusText: 'OK',
					headers: {
						'X-Header-A': 'value-a',
						'X-Header-B': 'value-b',
					},
				}),
			),
			{ preconnect: async () => {} },
		)

		try {
			const code = `
				async function fn() {
					const res = await fetch('http://example.com')
					const entries = []
					res.headers.forEach((value, name) => {
						entries.push({ name, value })
					})
					return { entries, count: entries.length }
				}
				export default await fn()
			`

			const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
				allowFetch: true,
			})

			expect(result.ok).toBeTrue()
			const data = (result as OkResponse).data as { count: number; entries: Array<{ name: string; value: string }> }
			expect(data.count).toBeGreaterThanOrEqual(2)
			expect(data.entries.some((e) => e.name === 'x-header-a' && e.value === 'value-a')).toBeTrue()
			expect(data.entries.some((e) => e.name === 'x-header-b' && e.value === 'value-b')).toBeTrue()
		} finally {
			global.fetch = originalFetch
		}
	})
})
