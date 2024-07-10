import { newQuickJSWASMModuleFromVariant, shouldInterruptAfterDeadline } from 'quickjs-emscripten-core'
import { Arena } from './sync/index.js'

import { provideConsole } from './provideConsole.js'
import { provideEnv } from './provideEnv.js'
import { provideFs } from './provideFs.js'
import { provideHttp } from './provideHttp.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

import type { ErrorResponse } from './types/ErrorResponse.js'
import type { InitResponseType } from './types/InitResponseType.js'
import type { OkResponse } from './types/OkResponse.js'

import type { IFs } from 'memfs'
import { createTimeInterval } from './createTimeInterval.js'
import { createVirtualFileSystem } from './createVirtualFileSystem.js'
import { getModuleLoader } from './getModuleLoader.js'
import { modulePathNormalizer } from './modulePathNormalizer.js'
import type { OkResponseCheck } from './types/OkResponseCheck.js'

/**
 * Loads and creates a QuickJS instance
 * @param wasmVariantName name of the variant
 * @returns
 */
export const quickJS = async (wasmVariantName = '@jitl/quickjs-ng-wasmfile-release-sync') => {
	const module = await newQuickJSWASMModuleFromVariant(import(wasmVariantName))

	const createRuntime = async (runtimeOptions: RuntimeOptions = {}, existingFs?: IFs): Promise<InitResponseType> => {
		const vm = module.newContext()

		const fs = existingFs ?? createVirtualFileSystem(runtimeOptions).fs

		vm.runtime.setModuleLoader(getModuleLoader(fs, runtimeOptions), modulePathNormalizer)

		const arena = new Arena(vm, { isMarshalable: true })

		provideFs(arena, runtimeOptions, fs)
		provideConsole(arena, runtimeOptions)
		provideEnv(arena, runtimeOptions)
		provideHttp(arena, runtimeOptions, { fs: runtimeOptions.allowFs ? fs : undefined })

		await arena.evalCode(`
          import 'node:util'
          import 'node:buffer'
          ${runtimeOptions.enableTestUtils ? "import 'test'" : ''}
        `)

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
			const getMaxTimeout = () => {
				let maxTimeout: number | undefined
				if (runtimeOptions.executionTimeout || evalOptions?.executionTimeout) {
					if (runtimeOptions.executionTimeout) {
						maxTimeout = runtimeOptions.executionTimeout
					}
					if (evalOptions?.executionTimeout) {
						if (maxTimeout) {
							maxTimeout = maxTimeout > evalOptions.executionTimeout ? evalOptions.executionTimeout : maxTimeout
						} else {
							maxTimeout = evalOptions.executionTimeout
						}
					}
				}
				return maxTimeout ? maxTimeout * 1_000 : undefined
			}

			if (getMaxTimeout()) {
				vm.runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + (getMaxTimeout() as number)))
			}

			using eventLoopinterval = createTimeInterval(() => {
				vm.runtime.executePendingJobs()
			}, 0)

			try {
				const evalResult = arena.evalCode(code, filename, {
					strict: true,
					strip: true,
					backtraceBarrier: true,
					...evalOptions,
					type: 'module',
				})

				const result = await Promise.race([
					(async () => {
						const res = await evalResult
						eventLoopinterval?.clear()
						return JSON.parse(JSON.stringify(res))
					})(),
					new Promise((_resolve, reject) => {
						const maxTimeout = getMaxTimeout()
						if (maxTimeout) {
							setTimeout(() => {
								eventLoopinterval?.clear()
								const err = new Error('The script execution has exceeded the maximum allowed time limit.')
								err.name = 'ExecutionTimeout'
								err.stack = undefined
								reject(err)
							}, maxTimeout)
						}
					}),
				])

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
				}
			}
		}

		/**
		 * Compile code only, but does not execute the code.
		 *
		 * @example
		 * ```js
		 * const result = await validateCode('export default await asyncFunction()')
		 * ```
		 */
		const validateCode: InitResponseType['validateCode'] = async (code, filename = '/src/index.js', evalOptions?) => {
			try {
				arena.evalCode(code, filename, {
					strict: true,
					strip: true,
					backtraceBarrier: true,
					...evalOptions,
					type: 'module',
					compileOnly: true,
				})
				return { ok: true } as OkResponseCheck
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
				}
			}
		}

		return { vm: arena, dispose, evalCode, validateCode }
	}

	return { createRuntime }
}
