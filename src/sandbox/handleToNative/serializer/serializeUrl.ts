import type {
    QuickJSAsyncContext,
    QuickJSContext,
    QuickJSHandle,
    Scope,
} from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeUrl: Serializer = (
    ctx: QuickJSContext | QuickJSAsyncContext,
    handle: QuickJSHandle,
    rootScope?: Scope,
) => {
	let d: URL | undefined
	ctx
                .newFunction('', value => {
                        const v = handleToNative(ctx, value, rootScope)
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
