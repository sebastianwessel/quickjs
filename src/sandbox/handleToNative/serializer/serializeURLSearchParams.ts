import type { QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import type { VMContext } from '../../../types/VMContext.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeURLSearchParams: Serializer = (ctx: VMContext, handle: QuickJSHandle) => {
	const h = new URLSearchParams()
	ctx
		.newFunction('', (value, name) => {
			const v = handleToNative(ctx, value)
			const n = handleToNative(ctx, name)
			h.append(n, v)
		})
		.consume(f => {
			call(
				ctx,
				'internal/serializer/serializeUrlSearchParams.js',
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
