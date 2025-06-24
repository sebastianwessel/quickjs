import type {
    QuickJSAsyncContext,
    QuickJSContext,
    QuickJSHandle,
    Scope,
} from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeMap: Serializer = (
    ctx: QuickJSContext | QuickJSAsyncContext,
    handle: QuickJSHandle,
    rootScope?: Scope,
) => {
	const m = new Map()
	ctx
                .newFunction('', (key, value) => {
                        const k = handleToNative(ctx, key, rootScope)
                        const v = handleToNative(ctx, value, rootScope)
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
