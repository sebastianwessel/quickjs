import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { call } from '../vmutil.js'

export default function marshalProperties(
	ctx: QuickJSContext,
	target: object | Function,
	handle: QuickJSHandle,
	marshal: (target: unknown) => QuickJSHandle,
): void {
	const descs = ctx.newObject()
	const cb = (key: string | number | symbol, desc: PropertyDescriptor) => {
		const keyHandle = marshal(key)
		const valueHandle = typeof desc.value === 'undefined' ? undefined : marshal(desc.value)
		const getHandle = typeof desc.get === 'undefined' ? undefined : marshal(desc.get)
		const setHandle = typeof desc.set === 'undefined' ? undefined : marshal(desc.set)

		ctx.newObject().consume(descObj => {
			Object.entries(desc).forEach(([k, v]) => {
				const v2 =
					k === 'value' ? valueHandle : k === 'get' ? getHandle : k === 'set' ? setHandle : v ? ctx.true : ctx.false
				if (v2) {
					ctx.setProp(descObj, k, v2)
				}
			})
			ctx.setProp(descs, keyHandle, descObj)
		})
	}

	const desc = Object.getOwnPropertyDescriptors(target)
	Object.entries(desc).forEach(([k, v]) => cb(k, v))
	Object.getOwnPropertySymbols(desc).forEach(k => cb(k, (desc as any)[k]))

	call(ctx, 'Object.defineProperties', undefined, handle, descs).dispose()

	descs.dispose()
}
