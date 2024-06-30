import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { isArrayBuffer } from '../vmutil.js'

export default function unmarshalPrimitive(ctx: QuickJSContext, handle: QuickJSHandle): [any, boolean] {
	if (isArrayBuffer(ctx, handle)) {
		const value = ctx.getArrayBuffer(handle)
		const buffer = value.value
		return [buffer.buffer, true]
	}
	const ty = ctx.typeof(handle)
	if (ty === 'undefined' || ty === 'number' || ty === 'string' || ty === 'boolean' || ty === 'bigint') {
		return [ctx.dump(handle), true]
	}
	if (ty === 'object') {
		const isNull = ctx
			.unwrapResult(ctx.evalCode('a => a === null'))
			.consume(n => ctx.dump(ctx.unwrapResult(ctx.callFunction(n, ctx.undefined, handle))))
		if (isNull) {
			return [null, true]
		}
	}

	return [undefined, false]
}
