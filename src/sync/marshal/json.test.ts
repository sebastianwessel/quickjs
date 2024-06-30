import { getQuickJS } from 'quickjs-emscripten'
import { expect, test, vi } from 'vitest'

import marshalJSON from './json'

test('empty object', async () => {
	const ctx = (await getQuickJS()).newContext()
	const prototypeCheck = ctx.unwrapResult(ctx.evalCode('o => Object.getPrototypeOf(o) === Object.prototype'))

	const obj = {}
	const preMarshal = vi.fn((_, a) => a)

	const handle = marshalJSON(ctx, obj, preMarshal)
	if (!handle) throw new Error('handle is undefined')

	expect(ctx.typeof(handle)).toBe('object')
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
	const preMarshal = vi.fn((_, a) => a)

	const handle = marshalJSON(ctx, obj, preMarshal)
	if (!handle) throw new Error('handle is undefined')

	expect(ctx.typeof(handle)).toBe('object')
	expect(ctx.getNumber(ctx.getProp(handle, 'a'))).toBe(100)
	expect(ctx.getString(ctx.getProp(handle, 'b'))).toBe('hoge')
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
	const preMarshal = vi.fn((_, a) => a)

	const handle = marshalJSON(ctx, array, preMarshal)
	if (!handle) throw new Error('handle is undefined')

	expect(ctx.typeof(handle)).toBe('object')
	expect(ctx.getNumber(ctx.getProp(handle, 0))).toBe(1)
	expect(ctx.getString(ctx.getProp(handle, 1))).toBe('aa')
	expect(ctx.getNumber(ctx.getProp(handle, 'length'))).toBe(2)
	expect(preMarshal).toBeCalledTimes(1)
	expect(preMarshal.mock.calls[0][0]).toBe(array)
	expect(preMarshal.mock.calls[0][1] === handle).toBe(true) // avoid freeze
	expect(ctx.dump(ctx.unwrapResult(ctx.callFunction(isArray, ctx.undefined, handle)))).toBe(true)

	handle.dispose()
	isArray.dispose()
	ctx.dispose()
})
