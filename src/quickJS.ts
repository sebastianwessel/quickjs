import {
	type ContextEvalOptions,
	type JSModuleLoader,
	type JSModuleNormalizer,
	newQuickJSWASMModuleFromVariant,
} from 'quickjs-emscripten-core'
import { Arena } from './sync/index.js'

import { mount } from './mount.js'
import { provideConsole } from './provideConsole.js'
import { provideEnv } from './provideEnv.js'
import { provideHttp } from './provideHttp.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

import type { ErrorResponse } from './types/ErrorResponse.js'
import type { InitResponseType } from './types/InitResponseType.js'
import type { OkResponse } from './types/OkResponse.js'

import { join, resolve } from 'node:path'
import { Volume } from 'memfs'

import fsModule from './modules/fs.js'
import pathModule from './modules/path.js'

const getModuleLoader = (options: RuntimeOptions) => {
	const customVol = options?.nodeModules ? Volume.fromNestedJSON(options?.nodeModules) : {}

	const modules: Record<string, any> = {
		'/': {
			node_modules: {
				...customVol,
				path: {
					'index.js': pathModule,
				},
			},
		},
	}
	if (options.allowFs) {
		modules['/'].node_modules.fs = { 'index.js': fsModule }
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

const moduleNormalizer: JSModuleNormalizer = (baseName: string, requestedName: string) => {
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

export const quickJS = async () => {
	const module = await newQuickJSWASMModuleFromVariant(import('@jitl/quickjs-ng-wasmfile-release-sync'))

	const initRuntime = async (options: RuntimeOptions = {}): Promise<InitResponseType> => {
		const vm = module.newContext()

		vm.runtime.setModuleLoader(getModuleLoader(options), moduleNormalizer)

		const arena = new Arena(vm, { isMarshalable: true })

		mount(arena, options)
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
		 */
		const evalCode = async (code: string, filename = '/src/index.js', options?: number | ContextEvalOptions) => {
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

	return { initRuntime }
}
