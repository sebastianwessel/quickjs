import type { IFs } from 'memfs'
import type { QuickJSAsyncContext, QuickJSContext, Scope } from 'quickjs-emscripten-core'
import { getDefaultFetchAdapter } from '../../adapter/fetch.js'
import type { RuntimeOptions } from '../../types/RuntimeOptions.js'
import { expose } from '../expose/expose.js'

/**
 * Provide http related functions
 */
export const provideHttp = (
	ctx: QuickJSContext | QuickJSAsyncContext,
	scope: Scope,
	options: RuntimeOptions,
	input?: { fs?: IFs | undefined },
) => {
	const injectUnsupported =
		<T = any>(name: string) =>
		() => {
			throw new Error(
				`Not supported: ${name} has been disabled for security reasons or is not supported by the runtime`,
			) as T
		}

	let fetchFunction: typeof fetch = Object.assign(injectUnsupported('fetch'), {
		preconnect: async (_url: string | URL, _options?: any) => {
			return
		},
	})

	if (options.allowFetch) {
		const adapter = options.fetchAdapter ?? getDefaultFetchAdapter({ fs: input?.fs })
		fetchFunction = Object.assign(adapter, {
			preconnect: async (_url: string | URL, _options?: any) => {
				return
			},
		})
	}

	expose(ctx, scope, {
		__parseURL: (input: string | URL, base?: string | URL | undefined) => {
			const url = new URL(input, base)
			return {
				href: url.href,
				origin: url.origin,
				protocol: url.protocol,
				username: url.username,
				password: url.password,
				host: url.host,
				hostname: url.hostname,
				port: url.port,
				pathname: url.pathname,
				hash: url.hash,
				search: url.search,
			}
		},
		fetch: fetchFunction,
	})
}
