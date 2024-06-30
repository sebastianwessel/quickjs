import { type JSModuleLoader, newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core'
import { Arena } from './sync/index.js'

import { mount } from './mount.js'
import { provideConsole } from './provideConsole.js'
import { provideEnv } from './provideEnv.js'
import { provideHttp } from './provideHttp.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

import { modules } from './modules/index.js'

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
	const initRuntime = async (options: RuntimeOptions = {}) => {
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

		return { vm: arena, dispose }
	}

	return { initRuntime }
}
