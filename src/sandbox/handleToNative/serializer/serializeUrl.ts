import type { QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import type { VMContext } from '../../../types/VMContext.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeUrl: Serializer = (ctx: VMContext, handle: QuickJSHandle) => {
	let d: URL | undefined
	ctx
		.newFunction('', value => {
			const v = handleToNative(ctx, value)
			d = new URL(v)
		})
		.consume(f => {
			call(
				ctx,
				'internal/serializer/serializeUrl.js',
				`(d,fn) => {
           fn(d.toJSON())
        }`,
				undefined,
				handle,
				f,
			).dispose()
		})
	return d
}
URLSearchParams
