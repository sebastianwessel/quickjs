import { type QuickJSWASMModule, newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core'
import type { LoadQuickJsOptions } from '../../types/LoadQuickJsOptions.js'

/**
 * Loads the webassembly file and prepares sandbox creation
 * @param loadOptions
 * @returns
 */
export const loadWasmModule = async (loadOptions: LoadQuickJsOptions): Promise<QuickJSWASMModule> => {
	try {
		if (typeof loadOptions === 'string') {
			return await newQuickJSWASMModuleFromVariant(import(loadOptions))
		}
		return loadOptions as QuickJSWASMModule
	} catch (error) {
		console.error(error)
		throw new Error('Failed to load webassembly', { cause: error })
	}
}
