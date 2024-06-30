import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { call } from '../vmutil.js'

import unmarshalProperties from './properties.js'

export default function unmarshalObject(
	ctx: QuickJSContext,
	handle: QuickJSHandle,
	unmarshal: (handle: QuickJSHandle) => [unknown, boolean],
	preUnmarshal: <T>(target: T, handle: QuickJSHandle) => T | undefined,
): object | undefined {
	if (
		ctx.typeof(handle) !== 'object' ||
		// null check
		ctx
			.unwrapResult(ctx.evalCode('o => o === null'))
			.consume(n => ctx.dump(ctx.unwrapResult(ctx.callFunction(n, ctx.undefined, handle))))
	)
		return

	const raw = call(ctx, 'Array.isArray', undefined, handle).consume(r => ctx.dump(r)) ? [] : {}
	const obj = preUnmarshal(raw, handle) ?? raw

	const prototype = call(
		ctx,
		`o => {
      const p = Object.getPrototypeOf(o);
      return !p || p === Object.prototype || p === Array.prototype ? undefined : p;
    }`,
		undefined,
		handle,
	).consume(prototype => {
		if (ctx.typeof(prototype) === 'undefined') return
		const [proto] = unmarshal(prototype)
		return proto
	})
	if (typeof prototype === 'object') {
		Object.setPrototypeOf(obj, prototype)
	}

	unmarshalProperties(ctx, handle, raw, unmarshal)

	return obj
}
