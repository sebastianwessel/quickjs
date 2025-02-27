import { type QuickJSAsyncWASMModule, newQuickJSAsyncWASMModuleFromVariant } from 'quickjs-emscripten-core'
import type { LoadAsyncQuickJsOptions } from '../types/LoadQuickJsOptions.js'

/**
 * Loads the webassembly file and prepares sandbox creation
 * @param loadOptions
 * @returns
 */
export const loadAsyncWasmModule = async (loadOptions: LoadAsyncQuickJsOptions): Promise<QuickJSAsyncWASMModule> => {
	try {
		if (typeof loadOptions === 'string') {
			return await newQuickJSAsyncWASMModuleFromVariant(import(loadOptions))
		}
		return loadOptions as QuickJSAsyncWASMModule
	} catch (error) {
		throw new Error('Failed to load webassembly', { cause: error })
	}
}
