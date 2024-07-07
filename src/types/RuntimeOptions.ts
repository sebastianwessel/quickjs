import type { DirectoryJSON } from 'memfs'

export type RuntimeOptions = {
	/**
	 * The maximum time in seconds a script can run.
	 * Unset or set to 0 for unlimited execution time.
	 */
	executionTimeout?: number
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
	allowFetch?: boolean
	/**
	 * The custom fetch adapter provided as host function in the QuickJS runtime
	 */
	fetchAdapter?: typeof fetch
	/**
	 * Includes test framework
	 * If enabled, the packages chai and mocha become available
	 * They are registered global
	 */
	enableTestUtils?: boolean
	/**
	 * Per default, the console log inside of QuickJS is passed to the host console log.
	 * Here, you can customize the handling and provide your own logging methods.
	 */
	console?: {
		log?: (message?: unknown, ...optionalParams: unknown[]) => void
		error?: (message?: unknown, ...optionalParams: unknown[]) => void
		warn?: (message?: unknown, ...optionalParams: unknown[]) => void
		info?: (message?: unknown, ...optionalParams: unknown[]) => void
		debug?: (message?: unknown, ...optionalParams: unknown[]) => void
		trace?: (message?: unknown, ...optionalParams: unknown[]) => void
		assert?: (condition?: boolean, ...data: unknown[]) => void
		count?: (label?: string) => void
		countReset?: (label?: string) => void
		dir?: (item?: unknown, options?: object) => void
		dirxml?: (...data: unknown[]) => void
		group?: (...label: unknown[]) => void
		groupCollapsed?: (...label: unknown[]) => void
		groupEnd?: () => void
		table?: (tabularData?: unknown, properties?: string[]) => void
		time?: (label?: string) => void
		timeEnd?: (label?: string) => void
		timeLog?: (label?: string, ...data: unknown[]) => void
		clear?: () => void
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
