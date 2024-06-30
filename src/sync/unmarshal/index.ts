import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import unmarshalCustom, { defaultCustom } from './custom.js'
import unmarshalFunction from './function.js'
import unmarshalObject from './object.js'
import unmarshalPrimitive from './primitive.js'
import unmarshalPromise from './promise.js'

export type Options = {
	ctx: QuickJSContext
	/** marshal returns handle and boolean indicates that the handle should be disposed after use */
	marshal: (target: unknown) => [QuickJSHandle, boolean]
	find: (handle: QuickJSHandle) => unknown | undefined
	pre: <T = unknown>(target: T, handle: QuickJSHandle) => T | undefined
	custom?: Iterable<(obj: QuickJSHandle, ctx: QuickJSContext) => any>
}

export function unmarshal(handle: QuickJSHandle, options: Options): any {
	const [result] = unmarshalInner(handle, options)
	return result
}

function unmarshalInner(handle: QuickJSHandle, options: Options): [any, boolean] {
	const { ctx, marshal, find, pre } = options

	{
		const [target, ok] = unmarshalPrimitive(ctx, handle)
		if (ok) return [target, false]
	}

	{
		const target = find(handle)
		if (target) {
			return [target, true]
		}
	}

	const unmarshal2 = (h: QuickJSHandle) => unmarshalInner(h, options)

	const result =
		unmarshalCustom(ctx, handle, pre, [...defaultCustom, ...(options.custom ?? [])]) ??
		unmarshalPromise(ctx, handle, marshal, pre) ??
		unmarshalFunction(ctx, handle, marshal, unmarshal2, pre) ??
		unmarshalObject(ctx, handle, unmarshal2, pre)

	return [result, false]
}

export default unmarshal
