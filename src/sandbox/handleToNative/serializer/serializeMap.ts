import type { QuickJSHandle } from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import type { VMContext } from '../../../types/VMContext.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeMap: Serializer = (ctx: VMContext, handle: QuickJSHandle) => {
	const m = new Map()
	ctx
		.newFunction('', (key, value) => {
			const k = handleToNative(ctx, key)
			const v = handleToNative(ctx, value)
			m.set(k, v)
		})
		.consume(f => {
			call(
				ctx,
				'internal/serializer/serializeMap.js',
				`(m,fn) => {
            for(const [key,value] of m.entries())
              fn(key,value)
          }`,
				undefined,
				handle,
				f,
			).dispose()
		})
	return m
}
