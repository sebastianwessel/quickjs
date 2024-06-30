import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

// import { call } from "../vmutil";

export default function marshalPrimitive(ctx: QuickJSContext, target: unknown): QuickJSHandle | undefined {
	if (target instanceof ArrayBuffer) {
		return ctx.newArrayBuffer(target)
	}
	switch (typeof target) {
		case 'undefined':
			return ctx.undefined
		case 'number':
			return ctx.newNumber(target)
		case 'string':
			return ctx.newString(target)
		case 'boolean':
			return target ? ctx.true : ctx.false
		case 'object':
			return target === null ? ctx.null : undefined
		// BigInt is now supported by quickjs-emscripten
		case 'bigint':
			return ctx.newBigInt(target)
	}

	return undefined
}
