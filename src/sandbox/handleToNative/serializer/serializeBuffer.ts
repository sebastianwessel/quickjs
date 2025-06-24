import type {
    QuickJSAsyncContext,
    QuickJSContext,
    QuickJSHandle,
    Scope,
} from 'quickjs-emscripten-core'
import type { Serializer } from '../../../types/Serializer.js'
import { call } from '../../helper.js'
import { handleToNative } from '../handleToNative.js'

export const serializeBuffer: Serializer = (
    ctx: QuickJSContext | QuickJSAsyncContext,
    handle: QuickJSHandle,
    rootScope?: Scope,
) => {
	let b: Buffer | undefined
	ctx
                .newFunction('', value => {
                        const v = handleToNative(ctx, value, rootScope)
			b = Buffer.from(v)
		})
		.consume(f => {
			call(
				ctx,
				'internal/serializer/serializeBuffer.js',
				`(b,fn) => {
                  fn(b.buffer)
                }`,
				undefined,
				handle,
				f,
			).dispose()
		})
	return b
}
