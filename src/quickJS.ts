import { type JSModuleLoader, type JSModuleNormalizer, newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core'
import { Arena } from './sync/index.js'

import { provideConsole } from './provideConsole.js'
import { provideEnv } from './provideEnv.js'
import { provideFs } from './provideFs.js'
import { provideHttp } from './provideHttp.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

import type { ErrorResponse } from './types/ErrorResponse.js'
import type { InitResponseType } from './types/InitResponseType.js'
import type { OkResponse } from './types/OkResponse.js'

import { join, resolve } from 'node:path'
import { Volume } from 'memfs'

import assertModule from './modules/assert.js'
import fsPromisesModule from './modules/fs-promises.js'
import fsModule from './modules/fs.js'
import pathModule from './modules/path.js'
import utilModule from './modules/util.js'

const getModuleLoader = (options: RuntimeOptions) => {
	const customVol = options?.nodeModules ? Volume.fromNestedJSON(options?.nodeModules) : {}

	const modules: Record<string, any> = {
		'/': {
			node_modules: {
				...customVol,
				path: {
					'index.js': pathModule,
				},
				util: {
					'index.js': utilModule,
				},
				assert: {
					'index.js': assertModule,
				},
			},
		},
	}
	if (options.allowFs) {
		modules['/'].node_modules.fs = { 'index.js': fsModule, promises: { 'index.js': fsPromisesModule } }
	}

	const vol = Volume.fromNestedJSON(modules)

	const moduleLoader: JSModuleLoader = (name, _context) => {
		if (!vol.existsSync(name)) {
			return { error: new Error(`Module '${name}' not installed or available`) }
		}

		const value = vol.readFileSync(name)?.toString()

		if (!value) {
			return { error: new Error(`Module '${name}' not installed or available`) }
		}
		return { value }
	}

	return moduleLoader
}

const modulePathNormalizer: JSModuleNormalizer = (baseName: string, requestedName: string) => {
	// relative import
	if (requestedName.startsWith('.')) {
		const parts = baseName.split('/')
		parts.pop()

		return resolve(`/${parts.join('/')}`, requestedName)
	}

	// module import
	const moduleName = requestedName.replace('node:', '')
	return join('/node_modules', moduleName, 'index.js')
}

/**
 * Utilizes the standard setInterval to work properly with javascript `using` statement.
 * Because of this, the interval gets automatically cleared on dispose.
 */
const createTimeInterval = (...params: Parameters<typeof setInterval>) => {
	const id = setInterval(...params)
	return {
		id,
		[Symbol.dispose]: () => {
			clearInterval(id)
		},
	}
}

/**
 * Loads and creates a QuickJS instance
 * @param wasmVariantName name of the variant
 * @returns
 */
export const quickJS = async (wasmVariantName = '@jitl/quickjs-ng-wasmfile-release-sync') => {
	const module = await newQuickJSWASMModuleFromVariant(import(wasmVariantName))

	const createRuntime = async (runtimeOptions: RuntimeOptions = {}): Promise<InitResponseType> => {
		const vm = module.newContext()

		vm.runtime.setModuleLoader(getModuleLoader(runtimeOptions), modulePathNormalizer)

		const arena = new Arena(vm, { isMarshalable: true })

		provideFs(arena, runtimeOptions)
		provideConsole(arena, runtimeOptions)
		provideEnv(arena, runtimeOptions)
		provideHttp(arena, runtimeOptions)

		const dispose = () => {
			let err: unknown | undefined
			try {
				arena.dispose()
			} catch (error) {
				err = error
				console.error('Failed to dispose arena')
			}

			try {
				vm.dispose()
			} catch (error) {
				err = error
				console.error('Failed to dispose context')
			}

			if (err) {
				throw err
			}
		}

		/**
		 * Execute code once and cleanup after execution.
		 *
		 * The result of the code execution must be exported with export default.
		 * If the code is async, it needs to be awaited on export.
		 *
		 * @example
		 * ```js
		 * const result = await evalCode('export default await asyncFunction()')
		 * ```
		 */
		const evalCode: InitResponseType['evalCode'] = async (code, filename = '/src/index.js', evalOptions?) => {
			try {
				let maxTimeout: number | undefined
				if (runtimeOptions.executionTimeout || evalOptions?.executionTimeout) {
					if (runtimeOptions.executionTimeout) {
						maxTimeout = runtimeOptions.executionTimeout
					}
					if (evalOptions?.executionTimeout) {
						if (maxTimeout && maxTimeout > evalOptions.executionTimeout) {
							maxTimeout = evalOptions.executionTimeout
						}
					}
				}

				using _eventLoopinterval = createTimeInterval(() => {
					vm.runtime.executePendingJobs()
				}, 0)

				vm.runtime.setInterruptHandler(runtime => {
					if (!maxTimeout) {
						return false
					}
					const abort = maxTimeout * 1_000 <= Date.now()

					if (abort && runtime.context?.alive) {
						runtime.context?.throw(new Error('timeout'))
					}
					return abort
				})

				const result = await arena.evalCode(code, filename, {
					strict: true,
					strip: true,
					backtraceBarrier: true,
					...evalOptions,
					type: 'module',
				})
				return { ok: true, data: result.default } as OkResponse
			} catch (err) {
				const e = err as Error

				const errorReturn: ErrorResponse = {
					ok: false,
					error: {
						name: `${e.name}`,
						message: `${e.message}`,
						stack: e.stack ? `${e.stack}` : undefined,
					},
					isSyntaxError: e.name === 'SyntaxError',
				}

				return errorReturn
			} finally {
				try {
					dispose()
				} catch (error) {
					console.error('Failed to dispose', error)
					// biome-ignore lint/correctness/noUnsafeFinally: <explanation>
					throw error
				}
			}
		}

		return { vm: arena, dispose, evalCode }
	}

	return { createRuntime }
}
