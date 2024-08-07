import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'

import { json } from '../vmutil.js'

import unmarshalFunction from './function.js'

test('arrow function', async () => {
	const ctx = (await getQuickJS()).newContext()
	const marshal = mock((v): [QuickJSHandle, boolean] => [json(ctx, v), false])
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => [ctx.dump(v), false])
	const preUnmarshal = mock(a => a)

	const handle = ctx.unwrapResult(ctx.evalCode('(a, b) => a + b'))
	const func = unmarshalFunction(ctx, handle, marshal, unmarshal, preUnmarshal)
	if (!func) throw new Error('func is undefined')

	expect(func(1, 2)).toBe(3)
	expect(marshal).toBeCalledTimes(3)
	expect(marshal).toBeCalledWith(undefined)
	expect(marshal).toBeCalledWith(1)
	expect(marshal).toBeCalledWith(2)
	expect(unmarshal).toHaveReturnedTimes(5)
	expect(unmarshal).toHaveReturnedWith([3, false]) // a + b
	expect(unmarshal).toHaveReturnedWith(['name', false])
	expect(unmarshal).toHaveReturnedWith([func.name, false])
	expect(unmarshal).toHaveReturnedWith(['length', false])
	expect(unmarshal).toHaveReturnedWith([func.length, false])
	expect(preUnmarshal).toBeCalledTimes(1)
	expect(preUnmarshal).toBeCalledWith(func, handle)

	handle.dispose()
	expect(() => func(1, 2)).toThrow('Lifetime not alive')

	ctx.dispose()
})

test('function', async () => {
	const ctx = (await getQuickJS()).newContext()
	const that = { a: 1 }
	const thatHandle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const marshal = mock((v): [QuickJSHandle, boolean] => [v === that ? thatHandle : json(ctx, v), false])
	const disposables: QuickJSHandle[] = []
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => {
		const ty = ctx.typeof(v)
		if (ty === 'object' || ty === 'function') disposables.push(v)
		return [ctx.dump(v), false]
	})
	const preUnmarshal = mock(a => a)

	const handle = ctx.unwrapResult(ctx.evalCode('(function (a) { return this.a + a; })'))

	const func = unmarshalFunction(ctx, handle, marshal, unmarshal, preUnmarshal)
	if (!func) throw new Error('func is undefined')

	expect(func.call(that, 2)).toBe(3)
	expect(marshal).toBeCalledTimes(2) // this, 2
	expect(marshal).toBeCalledWith(that)
	expect(marshal).toBeCalledWith(2)
	expect(unmarshal).toHaveReturnedTimes(7) // this.a + b, func.prototype, func.name, func.length
	expect(unmarshal).toHaveReturnedWith([3, false]) // this.a + b
	expect(unmarshal).toHaveReturnedWith(['prototype', false])
	expect(unmarshal).toHaveReturnedWith([func.prototype, false])
	expect(unmarshal).toHaveReturnedWith(['name', false])
	expect(unmarshal).toHaveReturnedWith([func.name, false])
	expect(unmarshal).toHaveReturnedWith(['length', false])
	expect(unmarshal).toHaveReturnedWith([func.length, false])
	expect(preUnmarshal).toBeCalledTimes(1)
	expect(preUnmarshal).toBeCalledWith(func, handle)

	disposables.forEach(d => d.dispose())
	thatHandle.dispose()
	handle.dispose()
	ctx.dispose()
})

test('constructor', async () => {
	const ctx = (await getQuickJS()).newContext()
	const disposables: QuickJSHandle[] = []
	const marshal = mock((v): [QuickJSHandle, boolean] => [typeof v === 'object' ? ctx.undefined : json(ctx, v), false])
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => {
		const ty = ctx.typeof(v)
		if (ty === 'object' || ty === 'function') disposables.push(v)
		return [ctx.dump(v), false]
	})
	const preUnmarshal = mock(a => a)

	const handle = ctx.unwrapResult(ctx.evalCode('(function (b) { this.a = b + 2; })'))

	const Cls = unmarshalFunction(ctx, handle, marshal, unmarshal, preUnmarshal) as any
	if (!Cls) throw new Error('Cls is undefined')

	const instance = new Cls(100)
	expect(instance instanceof Cls).toBe(true)
	expect(instance.a).toBe(102)
	expect(marshal).toBeCalledTimes(2)
	expect(marshal).toBeCalledWith(instance)
	expect(marshal).toBeCalledWith(100)
	expect(unmarshal).toHaveReturnedTimes(7)
	expect(unmarshal).toHaveReturnedWith([instance, false])
	expect(unmarshal).toHaveReturnedWith(['prototype', false])
	expect(unmarshal).toHaveReturnedWith([Cls.prototype, false])
	expect(unmarshal).toHaveReturnedWith(['name', false])
	expect(unmarshal).toHaveReturnedWith([Cls.name, false])
	expect(unmarshal).toHaveReturnedWith(['length', false])
	expect(unmarshal).toHaveReturnedWith([Cls.length, false])
	expect(preUnmarshal).toBeCalledTimes(1)
	expect(preUnmarshal).toBeCalledWith(Cls, handle)

	disposables.forEach(d => d.dispose())
	handle.dispose()
	ctx.dispose()
})

test('class', async () => {
	const ctx = (await getQuickJS()).newContext()
	const marshal = mock((v): [QuickJSHandle, boolean] => [typeof v === 'object' ? ctx.undefined : json(ctx, v), false])
	const disposables: QuickJSHandle[] = []
	const unmarshal = mock((v: QuickJSHandle): [unknown, boolean] => {
		const ty = ctx.typeof(v)
		if (ty === 'object' || ty === 'function') disposables.push(v)
		return [ctx.dump(v), false]
	})
	const preUnmarshal = mock(a => a)

	const handle = ctx.unwrapResult(ctx.evalCode('(class A { constructor(a) { this.a = a + 1; } })'))

	const Cls = unmarshalFunction(ctx, handle, marshal, unmarshal, preUnmarshal) as any
	if (!Cls) throw new Error('Cls is undefined')

	const instance = new Cls(2)
	expect(instance instanceof Cls).toBe(true)
	expect(instance.a).toBe(3)
	expect(marshal).toBeCalledTimes(2)
	expect(marshal).toBeCalledWith(instance)
	expect(marshal).toBeCalledWith(2)
	expect(unmarshal).toHaveReturnedTimes(7)
	expect(unmarshal).toHaveReturnedWith([instance, false])
	expect(unmarshal).toHaveReturnedWith(['prototype', false])
	expect(unmarshal).toHaveReturnedWith([Cls.prototype, false])
	expect(unmarshal).toHaveReturnedWith(['name', false])
	expect(unmarshal).toHaveReturnedWith([Cls.name, false])
	expect(unmarshal).toHaveReturnedWith(['length', false])
	expect(unmarshal).toHaveReturnedWith([Cls.length, false])
	expect(preUnmarshal).toBeCalledTimes(1)
	expect(preUnmarshal).toBeCalledWith(Cls, handle)

	disposables.forEach(d => d.dispose())
	handle.dispose()
	ctx.dispose()
})

test('undefined', async () => {
	const ctx = (await getQuickJS()).newContext()
	const f = mock()

	expect(unmarshalFunction(ctx, ctx.undefined, f, f, f)).toEqual(undefined)
	expect(unmarshalFunction(ctx, ctx.true, f, f, f)).toEqual(undefined)
	expect(unmarshalFunction(ctx, ctx.false, f, f, f)).toEqual(undefined)
	expect(unmarshalFunction(ctx, ctx.null, f, f, f)).toEqual(undefined)
	expect(unmarshalFunction(ctx, ctx.newString('hoge'), f, f, f)).toEqual(undefined)
	expect(unmarshalFunction(ctx, ctx.newNumber(-10), f, f, f)).toEqual(undefined)

	const obj = ctx.newObject()
	expect(unmarshalFunction(ctx, obj, f, f, f)).toEqual(undefined)
	const array = ctx.newArray()
	expect(unmarshalFunction(ctx, array, f, f, f)).toEqual(undefined)

	expect(f).toBeCalledTimes(0)

	obj.dispose()
	array.dispose()
	ctx.dispose()
})
