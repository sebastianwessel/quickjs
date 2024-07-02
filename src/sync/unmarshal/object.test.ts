import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'

import unmarshalObject from './object.js'

test('normal object', async () => {
	const ctx = (await getQuickJS()).newContext()
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => [ctx.dump(v), false])
	const preUnmarshal = mock(a => a)

	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1, b: true })'))
	const obj = unmarshalObject(ctx, handle, unmarshal, preUnmarshal)
	if (!obj) throw new Error('obj is undefined')
	expect(obj).toEqual({ a: 1, b: true })
	expect(unmarshal).toHaveReturnedTimes(4)
	expect(unmarshal).toReturnWith(['a', false])
	expect(unmarshal).toReturnWith([1, false])
	expect(unmarshal).toReturnWith(['b', false])
	expect(unmarshal).toReturnWith([true, false])
	expect(preUnmarshal).toBeCalledTimes(1)
	expect(preUnmarshal).toBeCalledWith(obj, handle)

	handle.dispose()
	ctx.dispose()
})

test('properties', async () => {
	const ctx = (await getQuickJS()).newContext()
	const disposables: QuickJSHandle[] = []
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => {
		disposables.push(v)
		return [ctx.typeof(v) === 'function' ? () => {} : ctx.dump(v), false]
	})
	const preUnmarshal = mock(a => a)

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
	const obj = unmarshalObject(ctx, handle, unmarshal, preUnmarshal)
	if (!obj) throw new Error('obj is undefined')
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
	expect(preUnmarshal).toBeCalledTimes(1)
	expect(preUnmarshal).toBeCalledWith(obj, handle)

	disposables.forEach(d => d.dispose())
	handle.dispose()
	ctx.dispose()
})

test('array', async () => {
	const ctx = (await getQuickJS()).newContext()
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => [ctx.dump(v), false])
	const preUnmarshal = mock(a => a)

	const handle = ctx.unwrapResult(ctx.evalCode(`[1, true, "a"]`))
	const array = unmarshalObject(ctx, handle, unmarshal, preUnmarshal)
	expect((array as any)[0]).toEqual(1)
	expect(Array.isArray(array)).toBe(true)
	expect(unmarshal.mock.results[0].value).toEqual(['0', false])
	expect(unmarshal.mock.results[1].value).toEqual([1, false])
	expect(unmarshal.mock.results[2].value).toEqual(['1', false])
	expect(unmarshal.mock.results[3].value).toEqual([true, false])
	expect(unmarshal.mock.results[4].value).toEqual(['2', false])
	expect(unmarshal.mock.results[5].value).toEqual(['a', false])
	expect(unmarshal.mock.results[6].value).toEqual(['length', false])
	expect(unmarshal.mock.results[7].value).toEqual([3, false])
	expect(preUnmarshal).toBeCalledWith(array, handle)

	handle.dispose()
	ctx.dispose()
})

test('prototype', async () => {
	const ctx = (await getQuickJS()).newContext()
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => [
		ctx.typeof(v) === 'object' ? { a: () => 1 } : ctx.dump(v),
		false,
	])
	const preUnmarshal = mock(a => a)

	const handle = ctx.unwrapResult(ctx.evalCode('Object.create({ a: () => 1 })'))
	const obj = unmarshalObject(ctx, handle, unmarshal, preUnmarshal) as any
	if (!obj) throw new Error('obj is undefined')
	expect(Object.getPrototypeOf(obj)).toEqual({ a: expect.any(Function) })
	expect(obj.a()).toBe(1)
	expect(unmarshal.mock.calls.length).toBe(1)
	expect(unmarshal).toReturnWith([Object.getPrototypeOf(obj), false])
	expect(preUnmarshal).toBeCalledTimes(1)
	expect(preUnmarshal).toBeCalledWith(obj, handle)

	handle.dispose()
	ctx.dispose()
})

test('undefined', async () => {
	const ctx = (await getQuickJS()).newContext()
	const f = mock()

	expect(unmarshalObject(ctx, ctx.undefined, f, f)).toEqual(undefined)
	expect(unmarshalObject(ctx, ctx.true, f, f)).toEqual(undefined)
	expect(unmarshalObject(ctx, ctx.false, f, f)).toEqual(undefined)
	expect(unmarshalObject(ctx, ctx.null, f, f)).toEqual(undefined)
	expect(unmarshalObject(ctx, ctx.newString('hoge'), f, f)).toEqual(undefined)
	expect(unmarshalObject(ctx, ctx.newNumber(-10), f, f)).toEqual(undefined)

	const func = ctx.newFunction('', () => {})
	expect(unmarshalObject(ctx, func, f, f)).toEqual(undefined)

	expect(f).toBeCalledTimes(0)

	func.dispose()
	ctx.dispose()
})
