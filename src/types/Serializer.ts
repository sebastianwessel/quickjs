import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

export type Serializer = (ctx: QuickJSContext, handle: QuickJSHandle) => any
