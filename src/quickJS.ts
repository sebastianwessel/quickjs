import { type ContextEvalOptions, type JSModuleLoader, newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core'
import { Arena } from './sync/index.js'

import { mount } from './mount.js'
import { provideConsole } from './provideConsole.js'
import { provideEnv } from './provideEnv.js'
import { provideHttp } from './provideHttp.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

import { modules } from './modules/index.js'
import type { ErrorResponse } from './types/ErrorResponse.js'
import type { InitResponseType } from './types/InitResponseType.js'
import type { OkResponse } from './types/OkResponse.js'

const moduleLoader: JSModuleLoader = (moduleName, _context) => {
	console.log('MODULE_LOADER', moduleName)

	if (['.', '/'].includes(moduleName[0])) {
		return { error: new Error(`Module '${moduleName}' not installed or available`) }
	}

	const name = moduleName.replace('node:', '')

	const module = modules.get(name)

	return module
		? {
				value: module,
			}
		: { error: new Error(`Module '${moduleName}' not installed or available`) }
}

export const quickJS = async () => {
	const module = await newQuickJSWASMModuleFromVariant(import('@jitl/quickjs-ng-wasmfile-release-sync'))
	const initRuntime = async (options: RuntimeOptions = {}): Promise<InitResponseType> => {
		const vm = module.newContext()

		vm.runtime.setModuleLoader(moduleLoader)

		const arena = new Arena(vm, { isMarshalable: true })

		mount(vm, options)
		provideConsole(arena, options)
		provideEnv(arena, options)
		provideHttp(arena, options)

		const dispose = () => {
			arena.dispose()
			vm.dispose()
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
		 *
		 * @param code
		 * @param filename index.js
		 * @param options { type: 'module' }
		 * @returns The code result
		 */
		const evalCode = async (code: string, filename = 'index.js', options?: number | ContextEvalOptions) => {
			try {
				const result = await arena.evalCode(code, filename, options ?? { type: 'module' })
				return { ok: true, data: result.default } as OkResponse
			} catch (err) {
				const e = err as Error

				const errorReturn: ErrorResponse = {
					ok: false,
					error: {
						name: `${e.name}`,
						message: `${e.message}`,
						stack: `${e.stack}`,
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

		return { vm: arena, dispose, evalCode }
	}

	return { initRuntime }
}
