import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'

import { json } from '../vmutil'

import marshalProperties from './properties'

test('works', async () => {
	const ctx = (await getQuickJS()).newContext()
	const descTester = ctx.unwrapResult(
		ctx.evalCode(`(obj, expected) => {
      const descs = Object.getOwnPropertyDescriptors(obj);
      for (const [k, v] of Object.entries(expected)) {
        const d = descs[k];
        if (v.valueType && typeof d.value !== v.valueType) throw new Error(k + " value invalid");
        if (v.getType && typeof d.get !== v.getType) throw new Error(k + " get invalid");
        if (v.setType && typeof d.set !== v.setType) throw new Error(k + " set invalid");
        if (typeof v.enumerable === "boolean" && d.enumerable !== v.enumerable) throw new Error(k + " enumerable invalid: " + d.enumerable);
        if (typeof v.configurable === "boolean" && d.configurable !== v.configurable) throw new Error(k + " configurable invalid: " + d.configurable);
        if (typeof v.writable === "boolean" && d.writable !== v.writable) throw new Error(k + " writable invalid: " + d.writable);
      }
    }`),
	)

	const disposables: QuickJSHandle[] = []
	const marshal = mock(t => {
		if (typeof t !== 'function') return json(ctx, t)
		const fn = ctx.newFunction('', () => {})
		disposables.push(fn)
		return fn
	})

	const handle = ctx.newObject()
	const obj = {}
	const bar = () => {}
	const fooGet = () => {}
	const fooSet = () => {}
	Object.defineProperties(obj, {
		bar: {
			value: bar,
			enumerable: true,
			configurable: true,
			writable: true,
		},
		foo: {
			get: fooGet,
			set: fooSet,
			enumerable: false,
			configurable: true,
		},
	})

	marshalProperties(ctx, obj, handle, marshal)
	expect(marshal.mock.calls).toEqual([['bar'], [bar], ['foo'], [fooGet], [fooSet]])

	const expected = ctx.unwrapResult(
		ctx.evalCode(`({
      bar: { valueType: "function", getType: "undefined", setType: "undefined", enumerable: true, configurable: true, writable: true },
      foo: { valueType: "undefined", getType: "function", setType: "function", enumerable: false, configurable: true }
    })`),
	)
	ctx.unwrapResult(ctx.callFunction(descTester, ctx.undefined, handle, expected))

	expected.dispose()
	disposables.forEach(d => d.dispose())
	handle.dispose()
	descTester.dispose()
	ctx.dispose()
})

test('empty', async () => {
	const ctx = (await getQuickJS()).newContext()
	const marshal = mock()
	const handle = ctx.newObject()
	const obj = {}

	marshalProperties(ctx, obj, handle, marshal)
	expect(marshal).toHaveBeenCalledTimes(0)

	handle.dispose()
	ctx.dispose()
})
