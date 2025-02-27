import type { QuickJSAsyncContext, QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'

export const serializeArrayBuffer: Serializer = (ctx: QuickJSContext | QuickJSAsyncContext, handle: QuickJSHandle) => {
	const b = ctx.getArrayBuffer(handle)
	return Uint8Array.from(b.value)
}
