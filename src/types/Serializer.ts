import type { QuickJSHandle } from 'quickjs-emscripten-core'
import type { VMContext } from './VMContext.js'

export type Serializer = (ctx: VMContext, handle: QuickJSHandle) => any
