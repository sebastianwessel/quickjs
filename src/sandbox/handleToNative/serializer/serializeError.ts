import type { QuickJSAsyncContext, QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeError: Serializer = (ctx: QuickJSContext | QuickJSAsyncContext, handle: QuickJSHandle) => {
	const d: Error = new Error()

	ctx
		.newFunction('serializeError', (value, name) => {
			const v = handleToNative(ctx, value)
			const n = handleToNative(ctx, name)
			Object.defineProperties(d, v)
			d.name = n
		})
		.consume(f => {
			call(
				ctx,
				'internal/serializer/serializeError.js',
				`(d,fn) => {
          fn(Object.getOwnPropertyDescriptors(d),d.name)
        }`,
				undefined,
				handle,
				f,
			).dispose()
		})
	return d
}
