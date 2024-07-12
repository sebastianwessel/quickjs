import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core'
import type { LoadQuickJsOptions } from '../types/LoadQuickJsOptions.js'
import type { WasmModule } from '../types/WasmModule.js'

/**
 * Loads the webassembly file and prepares sandbox creation
 * @param loadOptions
 * @returns
 */
export const loadWasmModule = async (loadOptions: LoadQuickJsOptions): Promise<WasmModule> => {
	try {
		if (typeof loadOptions === 'string') {
			return await newQuickJSWASMModuleFromVariant(import(loadOptions))
		}
		return loadOptions
	} catch (error) {
		throw new Error('Failed to load webassembly', { cause: error })
	}
}
