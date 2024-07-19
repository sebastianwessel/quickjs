import type { QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import type { VMContext } from '../../../types/VMContext.js'

export const serializeArrayBuffer: Serializer = (ctx: VMContext, handle: QuickJSHandle) => {
	const b = ctx.getArrayBuffer(handle)
	return Uint8Array.from(b.value)
}
