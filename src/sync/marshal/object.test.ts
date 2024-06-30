import { getQuickJS } from 'quickjs-emscripten'
import { expect, test, vi } from 'vitest'

import { call } from '../vmutil'

import marshalObject from './object'

test('empty object', async () => {
	const ctx = (await getQuickJS()).newContext()
	const prototypeCheck = ctx.unwrapResult(ctx.evalCode('o => Object.getPrototypeOf(o) === Object.prototype'))

	const obj = {}
	const marshal = vi.fn()
	const preMarshal = vi.fn((_, a) => a)

	const handle = marshalObject(ctx, obj, marshal, preMarshal)
	if (!handle) throw new Error('handle is undefined')

	expect(ctx.typeof(handle)).toBe('object')
	expect(marshal).toBeCalledTimes(0)
	expect(preMarshal).toBeCalledTimes(1)
	expect(preMarshal.mock.calls[0][0]).toBe(obj)
	expect(preMarshal.mock.calls[0][1] === handle).toBe(true) // avoid freeze
	expect(ctx.dump(ctx.unwrapResult(ctx.callFunction(prototypeCheck, ctx.undefined, handle)))).toBe(true)

	handle.dispose()
	prototypeCheck.dispose()
	ctx.dispose()
})

test('normal object', async () => {
	const ctx = (await getQuickJS()).newContext()
	const prototypeCheck = ctx.unwrapResult(ctx.evalCode('o => Object.getPrototypeOf(o) === Object.prototype'))
	const entries = ctx.unwrapResult(ctx.evalCode('Object.entries'))

	const obj = { a: 100, b: 'hoge' }
	const marshal = vi.fn(v =>
		typeof v === 'number' ? ctx.newNumber(v) : typeof v === 'string' ? ctx.newString(v) : ctx.null,
	)
	const preMarshal = vi.fn((_, a) => a)

	const handle = marshalObject(ctx, obj, marshal, preMarshal)
	if (!handle) throw new Error('handle is undefined')

	expect(ctx.typeof(handle)).toBe('object')
	expect(ctx.getNumber(ctx.getProp(handle, 'a'))).toBe(100)
	expect(ctx.getString(ctx.getProp(handle, 'b'))).toBe('hoge')
	expect(marshal.mock.calls).toEqual([['a'], [100], ['b'], ['hoge']])
	expect(preMarshal).toBeCalledTimes(1)
	expect(preMarshal.mock.calls[0][0]).toBe(obj)
	expect(preMarshal.mock.calls[0][1] === handle).toBe(true) // avoid freeze
	expect(ctx.dump(ctx.unwrapResult(ctx.callFunction(prototypeCheck, ctx.undefined, handle)))).toBe(true)
	const e = ctx.unwrapResult(ctx.callFunction(entries, ctx.undefined, handle))
	expect(ctx.dump(e)).toEqual([
		['a', 100],
		['b', 'hoge'],
	])

	e.dispose()
	handle.dispose()
	prototypeCheck.dispose()
	entries.dispose()
	ctx.dispose()
})

test('array', async () => {
	const ctx = (await getQuickJS()).newContext()
	const isArray = ctx.unwrapResult(ctx.evalCode('Array.isArray'))

	const array = [1, 'aa']
	const marshal = vi.fn(v =>
		typeof v === 'number' ? ctx.newNumber(v) : typeof v === 'string' ? ctx.newString(v) : ctx.null,
	)
	const preMarshal = vi.fn((_, a) => a)

	const handle = marshalObject(ctx, array, marshal, preMarshal)
	if (!handle) throw new Error('handle is undefined')

	expect(ctx.typeof(handle)).toBe('object')
	expect(ctx.getNumber(ctx.getProp(handle, 0))).toBe(1)
	expect(ctx.getString(ctx.getProp(handle, 1))).toBe('aa')
	expect(ctx.getNumber(ctx.getProp(handle, 'length'))).toBe(2)
	expect(marshal.mock.calls).toEqual([['0'], [1], ['1'], ['aa'], ['length'], [2]])
	expect(preMarshal).toBeCalledTimes(1)
	expect(preMarshal.mock.calls[0][0]).toBe(array)
	expect(preMarshal.mock.calls[0][1] === handle).toBe(true) // avoid freeze
	expect(ctx.dump(ctx.unwrapResult(ctx.callFunction(isArray, ctx.undefined, handle)))).toBe(true)

	handle.dispose()
	isArray.dispose()
	ctx.dispose()
})

test('prototype', async () => {
	const ctx = (await getQuickJS()).newContext()

	const proto = { a: 100 }
	const protoHandle = ctx.newObject()
	ctx.setProp(protoHandle, 'a', ctx.newNumber(100))
	const preMarshal = vi.fn((_, a) => a)

	const obj = Object.create(proto)
	obj.b = 'hoge'
	const handle = marshalObject(
		ctx,
		obj,
		v => (v === proto ? protoHandle : typeof v === 'string' ? ctx.newString(v) : ctx.null),
		preMarshal,
	)
	if (!handle) throw new Error('handle is undefined')

	expect(preMarshal).toBeCalledTimes(1)
	expect(preMarshal.mock.calls[0][0]).toBe(obj)
	expect(preMarshal.mock.calls[0][1] === handle).toBe(true) // avoid freeze
	expect(ctx.typeof(handle)).toBe('object')
	expect(ctx.getNumber(ctx.getProp(handle, 'a'))).toBe(100)
	expect(ctx.getString(ctx.getProp(handle, 'b'))).toBe('hoge')
	const e = call(ctx, 'Object.entries', undefined, handle)
	expect(ctx.dump(e)).toEqual([['b', 'hoge']])
	const protoHandle2 = call(ctx, 'Object.getPrototypeOf', ctx.undefined, handle)
	expect(ctx.dump(call(ctx, 'Object.is', undefined, protoHandle, protoHandle2))).toBe(true)

	protoHandle2.dispose()
	e.dispose()
	handle.dispose()
	protoHandle.dispose()
	ctx.dispose()
})
