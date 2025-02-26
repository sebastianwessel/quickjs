import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { call } from '../vmutil.js'

export default function marshalCustom(
	ctx: QuickJSContext,
	target: unknown,
	preMarshal: (target: unknown, handle: QuickJSHandle) => QuickJSHandle | undefined,
	custom: Iterable<(target: unknown, ctx: QuickJSContext) => QuickJSHandle | undefined>,
): QuickJSHandle | undefined {
	let handle: QuickJSHandle | undefined
	for (const c of custom) {
		handle = c(target, ctx)
		if (handle) break
	}
	return handle ? (preMarshal(target, handle) ?? handle) : undefined
}

export function symbol(target: unknown, ctx: QuickJSContext): QuickJSHandle | undefined {
	if (typeof target !== 'symbol') return
	const handle = call(
		ctx,
		'd => Symbol(d)',
		undefined,
		target.description ? ctx.newString(target.description) : ctx.undefined,
	)
	return handle
}

export function date(target: unknown, ctx: QuickJSContext): QuickJSHandle | undefined {
	if (!(target instanceof Date)) return
	const handle = call(ctx, 'd => new Date(d)', undefined, ctx.newNumber(target.getTime()))
	return handle
}

export const defaultCustom = [symbol, date]
