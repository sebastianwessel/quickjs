import type { RuntimeOptions } from 'quickjs-emscripten-core'
import type { InitResponseType } from './InitResponseType.js'

export type QuickJSEvalReturn = {
	initRuntime?: (options?: RuntimeOptions) => Promise<InitResponseType>
}
