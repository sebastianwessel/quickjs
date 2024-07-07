import { describe, expect, it, mock } from 'bun:test'
import { type GetFetchAdapterOptions, getDefaultFetchAdapter } from './fetch.js'

describe('core - fetch adapter', () => {
	it('should block disallowed hosts', async () => {
		const adapterOptions: GetFetchAdapterOptions = {
			disallowedHosts: ['example.com'],
		}
		const fetchAdapter = getDefaultFetchAdapter(adapterOptions)

		const response = await fetchAdapter('http://example.com')

		expect(response.status).toBe(403)
		expect(response.statusText).toBe('FORBIDDEN')
	})

	it('should allow allowed hosts', async () => {
		const adapterOptions: GetFetchAdapterOptions = {
			allowedHosts: ['example.com'],
		}
		const fetchAdapter = getDefaultFetchAdapter(adapterOptions)

		const response = await fetchAdapter('http://example.com')

		expect(response.status).not.toBe(403)
	})

	it('should respect timeout', async () => {
		const adapterOptions: GetFetchAdapterOptions = {
			timeout: 1000,
		}
		const fetchAdapter = getDefaultFetchAdapter(adapterOptions)

		try {
			await fetchAdapter('http://example.com', { signal: AbortSignal.timeout(50) })
		} catch (error) {
			expect((error as Error).name).toBe('AbortError')
		}
	})

	it('should apply rate limiting', async () => {
		const adapterOptions: GetFetchAdapterOptions = {
			rateLimitPoints: 1,
			rateLimitDuration: 1,
		}
		const fetchAdapter = getDefaultFetchAdapter(adapterOptions)

		const response1 = await fetchAdapter('http://example.com')
		expect(response1.status).not.toBe(429)

		const response2 = await fetchAdapter('http://example.com')
		expect(response2.status).toBe(429)
		expect(response2.statusText).toBe('TOO MANY REQUESTS')
	})

	it('should not enforce CORS policy by default', async () => {
		const adapterOptions: GetFetchAdapterOptions = {}
		const fetchAdapter = getDefaultFetchAdapter(adapterOptions)

		// Mocking fetch to return a response without CORS headers
		global.fetch = mock().mockResolvedValue(new Response('', { status: 200, statusText: 'OK' }))

		const response = await fetchAdapter('http://example.com')
		expect(response.status).toBe(200)
		expect(response.statusText).toBe('OK')
	})

	it('should enforce CORS policy if enabled', async () => {
		const adapterOptions: GetFetchAdapterOptions = {
			corsCheck: true,
		}
		const fetchAdapter = getDefaultFetchAdapter(adapterOptions)

		// Mocking fetch to return a response without CORS headers
		global.fetch = mock().mockResolvedValue(new Response('', { status: 200, statusText: 'OK' }))

		const response = await fetchAdapter('http://example.com')
		expect(response.status).toBe(403)
		expect(response.statusText).toBe('FORBIDDEN')
	})
})
