import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { isES2015Class, isObject } from '../util.js'
import { call } from '../vmutil.js'

import marshalProperties from './properties.js'

export default function marshalFunction(
	ctx: QuickJSContext,
	target: unknown,
	marshal: (target: unknown) => QuickJSHandle,
	unmarshal: (handle: QuickJSHandle) => unknown,
	preMarshal: (target: unknown, handle: QuickJSHandle) => QuickJSHandle | undefined,
	preApply?: (target: Function, thisArg: unknown, args: unknown[]) => any,
): QuickJSHandle | undefined {
	if (typeof target !== 'function') return

	const raw = ctx
		.newFunction(target.name, function (...argHandles) {
			const that = unmarshal(this)
			const args = argHandles.map(a => unmarshal(a))

			if (isES2015Class(target) && isObject(that)) {
				// Class constructors cannot be invoked without new expression, and new.target is not changed
				const result = new target(...args)
				Object.entries(result).forEach(([key, value]) => {
					ctx.setProp(this, key, marshal(value))
				})
				return this
			}

			return marshal(preApply ? preApply(target, that, args) : target.apply(that, args))
		})
		.consume(handle2 =>
			// fucntions created by vm.newFunction are not callable as a class constrcutor
			call(
				ctx,
				`Cls => {
          const fn = function(...args) { return Cls.apply(this, args); };
          fn.name = Cls.name;
          fn.length = Cls.length;
          return fn;
        }`,
				undefined,
				handle2,
			),
		)

	const handle = preMarshal(target, raw) ?? raw
	marshalProperties(ctx, target, raw, marshal)

	return handle
}
