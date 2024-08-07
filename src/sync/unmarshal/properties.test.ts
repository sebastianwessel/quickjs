import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'

import unmarshalProperties from './properties.js'

test('works', async () => {
	const ctx = (await getQuickJS()).newContext()
	const disposables: QuickJSHandle[] = []
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => {
		disposables.push(v)
		return [ctx.typeof(v) === 'function' ? () => {} : ctx.dump(v), false]
	})
	const obj = {}

	const handle = ctx.unwrapResult(
		ctx.evalCode(`{
      const obj = {};
      Object.defineProperties(obj, {
        a: { value: 1, writable: true, configurable: true, enumerable: true },
        b: { value: 2 },
        c: { get: () => {}, set: () => {} },
      });
      obj
    }`),
	)

	unmarshalProperties(ctx, handle, obj, unmarshal)

	expect(obj).toEqual({
		a: 1,
	})
	expect(Object.getOwnPropertyDescriptors(obj)).toEqual({
		a: { value: 1, writable: true, configurable: true, enumerable: true },
		b: { value: 2, writable: false, configurable: false, enumerable: false },
		c: {
			get: expect.any(Function),
			set: expect.any(Function),
			configurable: false,
			enumerable: false,
		},
	})
	expect(unmarshal).toBeCalledTimes(7) // a.value, b.value, c.get, c.set
	expect(unmarshal).toHaveReturnedWith(['a', false])
	expect(unmarshal).toHaveReturnedWith([1, false])
	expect(unmarshal).toHaveReturnedWith(['b', false])
	expect(unmarshal).toHaveReturnedWith([2, false])
	expect(unmarshal).toHaveReturnedWith(['c', false])
	expect(unmarshal).toHaveReturnedWith([expect.any(Function), false]) // get, set

	disposables.forEach(d => d.dispose())
	handle.dispose()
	ctx.dispose()
})
