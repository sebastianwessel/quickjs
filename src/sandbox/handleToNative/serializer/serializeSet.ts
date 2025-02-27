import type { QuickJSAsyncContext, QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeSet: Serializer = (ctx: QuickJSContext | QuickJSAsyncContext, handle: QuickJSHandle) => {
	const s = new Set()
	ctx
		.newFunction('', value => {
			const v = handleToNative(ctx, value)
			s.add(v)
		})
		.consume(f => {
			call(
				ctx,
				'internal/serializer/serializeSet.js',
				`(s,fn) => {
            s.forEach(fn)
          }`,
				undefined,
				handle,
				f,
			).dispose()
		})
	return s
}
