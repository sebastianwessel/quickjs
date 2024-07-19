import { Scope } from 'quickjs-emscripten-core'
import { getModuleLoader } from './getModuleLoader.js'
import { getTypescriptSupport } from './getTypescriptSupport.js'
import { modulePathNormalizer } from './modulePathNormalizer.js'

import { executeSandboxFunction } from './sandbox/executeSandboxFunction.js'
import { loadWasmModule } from './sandbox/loadWasmModule.js'
import { prepareNodeCompatibility } from './sandbox/prepareNodeCompatibility.js'
import { prepareSandbox } from './sandbox/prepareSandbox.js'
import { setupFileSystem } from './sandbox/setupFileSystem.js'
import type { LoadQuickJsOptions } from './types/LoadQuickJsOptions.js'

import type { SandboxFunction } from './types/SandboxFunction.js'
import type { SandboxOptions } from './types/SandboxOptions.js'

export const loadQuickJs = async (loadOptions: LoadQuickJsOptions = '@jitl/quickjs-wasmfile-release-sync') => {
	const module = await loadWasmModule(loadOptions)

	/**
	 * Provides a new sandbox and executes the given function.
	 * When the function has been finished, the sandbox gets disposed and can longer be used.
	 *
	 * @param sandboxedFunction
	 * @param sandboxOptions
	 * @returns
	 */
	const runSandboxed = async <T>(
		sandboxedFunction: SandboxFunction<T>,
		sandboxOptions: SandboxOptions = {},
	): Promise<T> => {
		const scope = new Scope()

		const ctx = scope.manage(module.newContext())

		// Virtual File System,
		const fs = setupFileSystem(sandboxOptions)

		// TypeScript Support:
		const { transpileVirtualFs, transpileFile } = await getTypescriptSupport(sandboxOptions.transformTypescript)
		// if typescript support is enabled, transpile all ts files in file system
		transpileVirtualFs(fs)

		// JS Module Loader
		ctx.runtime.setModuleLoader(getModuleLoader(fs, sandboxOptions), modulePathNormalizer)

		// Register Globals to be more Node.js compatible
		prepareNodeCompatibility(ctx, sandboxOptions)

		// Prepare the Sandbox
		// Expose Data and Functions to Client
		prepareSandbox(ctx, scope, sandboxOptions, fs)

		// Run the given Function
		const result = await executeSandboxFunction({
			ctx,
			fs,
			scope,
			sandboxOptions,
			sandboxedFunction,
			transpileFile,
		})

		scope.dispose()
		return result
	}

	return { runSandboxed, module }
}
