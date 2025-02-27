import type { IFs, NestedDirectoryJSON } from 'memfs'
import type {
	JSModuleLoader,
	JSModuleLoaderAsync,
	JSModuleNormalizer,
	JSModuleNormalizerAsync,
} from 'quickjs-emscripten-core'
import type { default as TS } from 'typescript'
import type { Prettify } from './Prettify.js'
import type { RuntimeOptions } from './RuntimeOptions.js'

export type SandboxBaseOptions = {
	/**
	 * The maximum time in seconds a script can run.
	 * Unset or set to 0 for unlimited execution time.
	 */
	executionTimeout?: number
	/**
	 * Set the max stack size for this runtime, in bytes. To remove the limit, set to 0.
	 */
	maxStackSize?: number
	/**
	 * Set the max memory this runtime can allocate. To remove the limit, set to -1
	 */
	memoryLimit?: number
	/**
	 * Mount a virtual file system
	 * @link https://github.com/streamich/memfs
	 */
	mountFs?: NestedDirectoryJSON | IFs
	/**
	 * Mount custom node_modules in a virtual file system
	 * @link https://github.com/streamich/memfs
	 */
	nodeModules?: NestedDirectoryJSON
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
	 * It is not limited to primitives like string and numbers.
	 * Objects, arrays and functions can be provided as well.
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
	/**
	 * The object is synchronized between host and guest system.
	 * This means, the values on the host, can be set by the guest system
	 */
	dangerousSync?: Record<string, unknown>
	/**
	 * The Typescript lib to import
	 * @default typescript
	 */
	typescriptImportFile?: string
	/**
	 * Transpile all typescript files to javascript file in mountFs
	 * Requires dependency typescript to be installed
	 */
	transformTypescript?: boolean
	/**
	 * The Typescript compiler options for transpiling files from typescript to JavaScript
	 */
	transformCompilerOptions?: TS.CompilerOptions
	/**
	 * As the timeout function is injected from host to client, in theory the client could create a massive amount of timeouts, which are executed by the host.
	 * This might impact the host.
	 * Because of this, the maximum concurrent running timeouts is limited by this option.
	 *
	 * @default 100
	 */
	maxTimeoutCount?: number
	/**
	 * As the interval function is injected from host to client, in theory the client could create a massive amount of intervals, which are executed by the host.
	 * This might impact the host.
	 * Because of this, the maximum concurrent running intervals is limited by this option.
	 *
	 * @default 100
	 */
	maxIntervalCount?: number
}

/**
 * The sandbox options for regular sync QuickJS webassembly
 */
export type SandboxOptions = Prettify<
	SandboxBaseOptions & {
		/**
		 * A function which returns a custom module loader
		 * @param fs
		 * @param _runtimeOptions
		 * @returns JSModuleLoader
		 */
		getModuleLoader?: (fs: IFs, _runtimeOptions: RuntimeOptions) => JSModuleLoader
		/**
		 * A function to transform modules paths from imports before sent to the module loader
		 * @param baseName
		 * @param requestedName
		 * @returns
		 */
		modulePathNormalizer?: JSModuleNormalizer
	}
>

/**
 * The sandbox options for async QuickJS webassembly
 */
export type SandboxAsyncOptions = Prettify<
	SandboxBaseOptions & {
		/**
		 * A function which returns a custom module loader
		 * @param fs
		 * @param _runtimeOptions
		 * @returns JSModuleLoaderAsync
		 */
		getModuleLoader?: (fs: IFs, _runtimeOptions: RuntimeOptions) => JSModuleLoaderAsync
		/**
		 * A function to transform modules paths from imports before sent to the module loader
		 * @param baseName
		 * @param requestedName
		 * @returns
		 */
		modulePathNormalizer?: JSModuleNormalizerAsync
	}
>
