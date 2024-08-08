import { QuickJSContext } from "quickjs-emscripten-core";
import { RuntimeValueTransformer } from "./runtimeValueTransformer.js";
import { exposeToCtxGlobal } from "./utils.js";

export function patchCustomGlobals(vm: QuickJSContext, transformer: RuntimeValueTransformer, globals: Record<string, unknown>) {
  for (const [key, value] of Object.entries(globals)) {
    exposeToCtxGlobal(vm, key, transformer.wrapNativeValue(value))
  }
}