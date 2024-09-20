import type { QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import type { VMContext } from '../../../types/VMContext.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeDate: Serializer = (ctx: VMContext, handle: QuickJSHandle) => {
	const d = new Date()
	ctx
		.newFunction('', value => {
			const v = handleToNative(ctx, value)
			d.setTime(v)
		})
		.consume(f => {
			call(
				ctx,
				'internal/serializer/serializeDate.js',
				`(d,fn) => {
                  fn(d.getTime())
                }`,
				undefined,
				handle,
				f,
			).dispose()
		})
	return d
}
