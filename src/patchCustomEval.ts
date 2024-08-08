import { QuickJSContext } from "quickjs-emscripten-core"
import { RuntimeValueTransformer } from "./runtimeValueTransformer.js"
import { exposeToCtxGlobal } from "./utils.js"

function customEval(code: string): never {
	console.log('User tried to execute following code within eval():', code)
	throw new Error('Code evaluation is forbidden')
}

export function patchCustomEval(vm: QuickJSContext, transformer: RuntimeValueTransformer) {
  exposeToCtxGlobal(vm, 'eval', transformer.wrapNativeValue(customEval))
}