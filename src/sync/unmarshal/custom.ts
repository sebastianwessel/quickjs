import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { call } from '../vmutil.js'

export default function unmarshalCustom(
	ctx: QuickJSContext,
	handle: QuickJSHandle,
	preUnmarshal: <T>(target: T, handle: QuickJSHandle) => T | undefined,
	custom: Iterable<(handle: QuickJSHandle, ctx: QuickJSContext) => any>,
): symbol | undefined {
	let obj: any
	for (const c of custom) {
		obj = c(handle, ctx)
		if (obj) break
	}
	return obj ? preUnmarshal(obj, handle) ?? obj : undefined
}

export function symbol(handle: QuickJSHandle, ctx: QuickJSContext): symbol | undefined {
	if (ctx.typeof(handle) !== 'symbol') return
	const desc = ctx.getString(ctx.getProp(handle, 'description'))
	return Symbol(desc)
}

export function date(handle: QuickJSHandle, ctx: QuickJSContext): Date | undefined {
	if (!ctx.dump(call(ctx, 'a => a instanceof Date', undefined, handle))) return
	const t = ctx.getNumber(call(ctx, 'a => a.getTime()', undefined, handle))
	return new Date(t)
}

export const defaultCustom = [symbol, date]
