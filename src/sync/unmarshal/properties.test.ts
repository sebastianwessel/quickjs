import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'
import { expect, test, vi } from 'vitest'

import unmarshalProperties from './properties.js'

test('works', async () => {
	const ctx = (await getQuickJS()).newContext()
	const disposables: QuickJSHandle[] = []
	const unmarshal = vi.fn((v: QuickJSHandle): [unknown, boolean] => {
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
	expect(unmarshal).toReturnWith(['a', false])
	expect(unmarshal).toReturnWith([1, false])
	expect(unmarshal).toReturnWith(['b', false])
	expect(unmarshal).toReturnWith([2, false])
	expect(unmarshal).toReturnWith(['c', false])
	expect(unmarshal).toReturnWith([expect.any(Function), false]) // get, set

	disposables.forEach(d => d.dispose())
	handle.dispose()
	ctx.dispose()
})
