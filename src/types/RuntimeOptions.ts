import type { DirectoryJSON } from 'memfs'

export type RuntimeOptions = {
	/**
	 * Mount a virtual file system
	 * @link https://github.com/streamich/memfs
	 */
	mountFs?: DirectoryJSON
	/**
	 * Mount custom node_modules in a virtual file system
	 * @link https://github.com/streamich/memfs
	 */
	nodeModules?: DirectoryJSON
	/**
	 * Enable file capabilities
	 * If enabled, the package node:fs becomes available
	 */
	allowFs?: boolean
	/**
	 * Allow code to make http(s) calls.
	 * When enabled, the global fetch will be available
	 */
	allowHttp?: boolean
	/**
	 * Per default, the console log inside of QuickJS is passed to the host console log.
	 * Here, you can customize the handling and provide your own logging methods.
	 */
	console?: {
		log: (message?: unknown, ...optionalParams: unknown[]) => void
		error: (message?: unknown, ...optionalParams: unknown[]) => void
		warn: (message?: unknown, ...optionalParams: unknown[]) => void
	}
	/**
	 * Key-value list of ENV vars, which should be available in QuickJS
	 *
	 * @example
	 * ```js
	 * // in config
	 * {
	 *   env: {
	 *     My_ENV: 'my var'
	 *   }
	 * }
	 *
	 * // inside of QuickJS
	 * console.log(env.My_ENV) // outputs: my var
	 * ```
	 */
	env?: Record<string, unknown>
}
