import type { QuickJSContext, QuickJSDeferredPromise, QuickJSHandle } from 'quickjs-emscripten-core'

import marshalCustom, { defaultCustom } from './custom.js'
import marshalFunction from './function.js'
import marshalJSON from './json.js'
import marshalObject from './object.js'
import marshalPrimitive from './primitive.js'
import marshalPromise from './promise.js'

export type Options = {
	ctx: QuickJSContext
	unmarshal: (handle: QuickJSHandle) => unknown
	isMarshalable?: (target: unknown) => boolean | 'json'
	find: (target: unknown) => QuickJSHandle | undefined
	pre: (
		target: unknown,
		handle: QuickJSHandle | QuickJSDeferredPromise,
		mode: true | 'json' | undefined,
	) => QuickJSHandle | undefined
	preApply?: (target: Function, thisArg: unknown, args: unknown[]) => any
	custom?: Iterable<(obj: unknown, ctx: QuickJSContext) => QuickJSHandle | undefined>
}

export function marshal(target: unknown, options: Options): QuickJSHandle {
	const { ctx, unmarshal, isMarshalable, find, pre } = options

	{
		const primitive = marshalPrimitive(ctx, target)
		if (primitive) {
			return primitive
		}
	}

	{
		const handle = find(target)
		if (handle) return handle
	}

	const marshalable = isMarshalable?.(target)
	if (marshalable === false) {
		return ctx.undefined
	}

	const pre2 = (target: any, handle: QuickJSHandle | QuickJSDeferredPromise) => pre(target, handle, marshalable)
	if (marshalable === 'json') {
		return marshalJSON(ctx, target, pre2)
	}

	const marshal2 = (t: unknown) => marshal(t, options)
	return (
		marshalCustom(ctx, target, pre2, [...defaultCustom, ...(options.custom ?? [])]) ??
		marshalPromise(ctx, target, marshal2, pre2) ??
		marshalFunction(ctx, target, marshal2, unmarshal, pre2, options.preApply) ??
		marshalObject(ctx, target, marshal2, pre2) ??
		ctx.undefined
	)
}

export default marshal
