import type { QuickJSAsyncContext, QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeHeaders: Serializer = (ctx: QuickJSContext | QuickJSAsyncContext, handle: QuickJSHandle) => {
	const h = new Headers()
	ctx
		.newFunction('', (value, name) => {
			const v = handleToNative(ctx, value)
			const n = handleToNative(ctx, name)
			h.append(n, v)
		})
		.consume(f => {
			call(
				ctx,
				'internal/serializer/serializeHeaders.js',
				`(h, fn) => {
          h.forEach(fn)
        }`,
				undefined,
				handle,
				f,
			).dispose()
		})
	return h
}
