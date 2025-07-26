import { newQuickJSWASMModuleFromVariant, Scope, shouldInterruptAfterDeadline } from 'quickjs-emscripten-core'
import { getTypescriptSupport } from './getTypescriptSupport.js'
import { setupFileSystem } from './sandbox/setupFileSystem.js'
import { executeSandboxFunction } from './sandbox/syncVersion/executeSandboxFunction.js'
import { getModuleLoader } from './sandbox/syncVersion/getModuleLoader.js'
import { modulePathNormalizer } from './sandbox/syncVersion/modulePathNormalizer.js'
import { prepareNodeCompatibility } from './sandbox/syncVersion/prepareNodeCompatibility.js'
import { prepareSandbox } from './sandbox/syncVersion/prepareSandbox.js'
import type { LoadQuickJsOptions } from './types/LoadQuickJsOptions.js'
import type { SandboxFunction } from './types/SandboxFunction.js'
import type { SandboxOptions } from './types/SandboxOptions.js'

/**
 * Loads the QuickJS module and returns a sandbox execution function.
 * @param variant - Options for loading the QuickJS module. Defaults to '@jitl/quickjs-ng-wasmfile-release-sync'.
 * @returns An object containing the runSandboxed function and the loaded module.
 */
export const loadQuickJs = async (variant: LoadQuickJsOptions) => {
	const module = await newQuickJSWASMModuleFromVariant(variant)
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
		try {
			const scope = new Scope()

			const ctx = scope.manage(module.newContext())

			if (sandboxOptions.executionTimeout) {
				ctx.runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + sandboxOptions.executionTimeout))
			}

			if (sandboxOptions.maxStackSize) {
				ctx.runtime.setMaxStackSize(sandboxOptions.maxStackSize)
			}

			if (sandboxOptions.memoryLimit) {
				ctx.runtime.setMemoryLimit(sandboxOptions.memoryLimit)
			}

			// Virtual File System,
			const fs = setupFileSystem(sandboxOptions)

			// TypeScript Support:
			const { transpileVirtualFs, transpileFile } = await getTypescriptSupport(
				sandboxOptions.transformTypescript,
				sandboxOptions.typescriptImportFile,
				sandboxOptions.transformCompilerOptions,
			)
			// if typescript support is enabled, transpile all ts files in file system
			transpileVirtualFs(fs)

			// JS Module Loader
			const moduleLoader = sandboxOptions.getModuleLoader
				? sandboxOptions.getModuleLoader(fs, sandboxOptions)
				: getModuleLoader(fs, sandboxOptions)
			ctx.runtime.setModuleLoader(moduleLoader, sandboxOptions.modulePathNormalizer ?? modulePathNormalizer)

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
		} catch (error) {
			throw error instanceof Error ? error : new Error('Internal Error')
		}
	}

	return { runSandboxed, module }
}
