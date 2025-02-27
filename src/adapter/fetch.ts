import type { IFs } from 'memfs'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const DISALLOW_HOSTS_DEFAULT = ['localhost', '127.0.0.1']
const DEFAULT_TIMEOUT = 5000 // 5 seconds
const DEFAULT_RATE_LIMIT_POINTS = 10 // Number of requests
const DEFAULT_RATE_LIMIT_DURATION = 1 // Per second

/**
 * Options for creating the default fetch adapter
 */
export type GetFetchAdapterOptions = {
	/**
	 * The virtual file system of the sandbox (excludes node_modules)
	 */
	fs?: IFs
	/**
	 * List of allowed hosts. If set, only these hosts are allowed to call
	 */
	allowedHosts?: string[]
	/**
	 * List of allowed protocols. If set, only these protocols are allowed to call
	 */
	allowedProtocols?: string[]
	/**
	 * List of disallowed hosts. If set, these hosts are not allowed to call
	 * @default ['localhost', '127.0.0.1']
	 */
	disallowedHosts?: string[]
	/**
	 * Timeout for fetch requests in milliseconds
	 * @default 5000
	 */
	timeout?: number
	/**
	 * Flag to enable CORS policy check
	 * @default false
	 */
	corsCheck?: boolean
	/**
	 * List of allowed CORS origins
	 * @default ['*']
	 */
	allowedCorsOrigins?: string[]
	/**
	 * Number of requests allowed in the specified duration
	 * @default 10
	 */
	rateLimitPoints?: number
	/**
	 * Duration in seconds for the rate limit
	 * @default 1
	 */
	rateLimitDuration?: number
}

/**
 * Map a fetch Response to a simplified response object
 * @param res The original response
 * @returns The mapped response object
 */
const mapResponse = (res: Response) => ({
	status: res.status,
	ok: res.ok,
	statusText: res.statusText,
	json: () => res.json(),
	text: () => res.text(),
	formData: () => res.formData(),
	headers: res.headers,
	type: res.type,
	url: res.url,
	blob: () => res.blob(),
	bodyUsed: res.bodyUsed,
	redirected: res.redirected,
	body: res.body,
	arrayBuffer: () => res.arrayBuffer(),
	clone: () => res.clone(),
	bytes: res.bytes,
})

/**
 * Create a 403 forbidden response
 * @returns A 403 forbidden response
 */
const getForbiddenResponse = () => {
	const res = new Response('', { status: 403, statusText: 'FORBIDDEN' })
	return mapResponse(res)
}

/**
 * Create a default fetch adapter
 * @param adapterOptions Options for creating the fetch adapter
 * @returns A fetch adapter function
 */
export const getDefaultFetchAdapter = (adapterOptions: GetFetchAdapterOptions = {}): typeof fetch => {
	const options = {
		allowedProtocols: ['http:', 'https:'],
		disallowedHosts: adapterOptions.disallowedHosts ?? DISALLOW_HOSTS_DEFAULT,
		timeout: adapterOptions.timeout ?? DEFAULT_TIMEOUT,
		corsCheck: adapterOptions.corsCheck ?? false,
		allowedCorsOrigins: adapterOptions.allowedCorsOrigins ?? ['*'],
		rateLimitPoints: adapterOptions.rateLimitPoints ?? DEFAULT_RATE_LIMIT_POINTS,
		rateLimitDuration: adapterOptions.rateLimitDuration ?? DEFAULT_RATE_LIMIT_DURATION,
		...adapterOptions,
	}

	const rateLimiter = new RateLimiterMemory({
		points: options.rateLimitPoints,
		duration: options.rateLimitDuration,
	})

	const fetchAdapter: typeof fetch = async (input, init) => {
		try {
			await rateLimiter.consume('fetch', 1)

			const parsedUrl = new URL(input.toString())

			if (options.disallowedHosts.includes(parsedUrl.hostname)) {
				return getForbiddenResponse()
			}

			if (options.allowedHosts && !options.allowedHosts.includes(parsedUrl.hostname)) {
				return getForbiddenResponse()
			}

			if (!options.allowedProtocols.includes(parsedUrl.protocol)) {
				return getForbiddenResponse()
			}

			// Prevent accessing the host's file system
			if (parsedUrl.protocol === 'file:') {
				// No virtual guest file system available
				if (!options.fs) {
					return getForbiddenResponse()
				}

				// Return the file from the virtual file system of this sandbox if available.
				if (!options.fs.existsSync(input.toString())) {
					const res = new Response('', { status: 404, statusText: 'NOT_FOUND' })
					return mapResponse(res)
				}

				const content = options.fs.readFileSync(input.toString())
				const res = new Response(content, { status: 200, statusText: 'OK' })
				return mapResponse(res)
			}

			const initWithDefaults: RequestInit = {
				redirect: 'error',
				...init,
				// Set a timeout to prevent long-running requests
				signal: AbortSignal.timeout(options.timeout),
			}

			const res = await fetch(input, initWithDefaults)

			// Enforce CORS policies if not disabled
			if (options.corsCheck) {
				const origin = res.headers.get('Access-Control-Allow-Origin')
				if (!origin || (!options.allowedCorsOrigins.includes('*') && !options.allowedCorsOrigins.includes(origin))) {
					return getForbiddenResponse()
				}
			}

			return mapResponse(res)
		} catch (rateLimiterRes) {
			if (rateLimiterRes instanceof Error) {
				console.error('Fetch adapter error:', rateLimiterRes)
				const res = new Response('', { status: 500, statusText: 'INTERNAL SERVER ERROR' })
				return mapResponse(res)
			}
			const res = new Response('', { status: 429, statusText: 'TOO MANY REQUESTS' })
			return mapResponse(res)
		}
	}

	return fetchAdapter
}
