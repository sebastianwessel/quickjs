import { getModuleLoader } from './getModuleLoader.js'
import { getTypescriptSupport } from './getTypescriptSupport.js'
import { modulePathNormalizer } from './modulePathNormalizer.js'

import { executeSandboxFunction } from './sandbox/executeSandboxFunction.js'
import { loadWasmModule } from './sandbox/loadWasmModule.js'
import { prepareNodeCompatibility } from './sandbox/prepareNodeCompatibility.js'
import { prepareSandbox } from './sandbox/prepareSandbox.js'
import { setupFileSystem } from './sandbox/setupFileSystem.js'
import { Arena } from './sync/index.js'
import type { DisposeFunction } from './types/DisposeFunction.js'
import type { LoadQuickJsOptions } from './types/LoadQuickJsOptions.js'

import type { SandboxFunction } from './types/SandboxFunction.js'
import type { SandboxOptions } from './types/SandboxOptions.js'

export const loadQuickJs = async (loadOptions: LoadQuickJsOptions = '@jitl/quickjs-ng-wasmfile-release-sync') => {
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
		const vm = module.newContext()

		// Virtual File System,
		const fs = setupFileSystem(sandboxOptions)

		// TypeScript Support:
		const { transpileVirtualFs, transpileFile } = await getTypescriptSupport(sandboxOptions.transformTypescript)
		// if typescript support is enabled, transpile all ts files in file system
		transpileVirtualFs(fs)

		// JS Module Loader
		vm.runtime.setModuleLoader(getModuleLoader(fs, sandboxOptions), modulePathNormalizer)

		// Register Globals to be more Node.js compatible
		prepareNodeCompatibility(vm, sandboxOptions)

		// Initialize the helper for Data Exchange between Host and Client
		const arena = new Arena(vm, { isMarshalable: true })

		// Prepare the Sandbox
		// Expose Data and Functions to Client
		prepareSandbox(arena, sandboxOptions, fs)

		// Disposals which should run at the very end
		const finalDisposals: { name: string; dispose: DisposeFunction }[] = [
			{ name: 'Arena', dispose: arena.dispose },
			{ name: 'Runtime', dispose: vm.dispose },
		]

		// Run the given Function
		return executeSandboxFunction({
			arena,
			fs,
			sandboxOptions,
			sandboxedFunction,
			transpileFile,
			finalDisposals,
		})
	}

	return { runSandboxed }
}
