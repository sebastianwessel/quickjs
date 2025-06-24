import type {
    QuickJSAsyncContext,
    QuickJSContext,
    QuickJSHandle,
    Scope,
} from 'quickjs-emscripten-core'

export type Serializer = (
    ctx: QuickJSContext | QuickJSAsyncContext,
    handle: QuickJSHandle,
    rootScope?: Scope,
) => any
