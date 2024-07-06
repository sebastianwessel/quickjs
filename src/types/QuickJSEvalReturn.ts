import type { RuntimeOptions } from 'quickjs-emscripten-core'
import type { InitResponseType } from './InitResponseType.js'

export type QuickJSEvalReturn = {
	createRuntime?: (options?: RuntimeOptions) => Promise<InitResponseType>
}
