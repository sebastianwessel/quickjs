import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'

import {
	call,
	consumeAll,
	eq,
	fn,
	handleFrom,
	instanceOf,
	isHandleObject,
	json,
	mayConsume,
	mayConsumeAll,
} from './vmutil'

test('fn', async () => {
	const ctx = (await getQuickJS()).newContext()

	const f = fn(ctx, '(a, b) => a + b')
	expect(ctx.getNumber(f(undefined, ctx.newNumber(1), ctx.newNumber(2)))).toBe(3)

	const obj = ctx.newObject()
	ctx.setProp(obj, 'a', ctx.newNumber(2))
	const f2 = fn(ctx, '(function() { return this.a + 1; })')
	expect(ctx.getNumber(f2(obj))).toBe(3)

	obj.dispose()
	expect(f.alive).toBe(true)
	expect(f2.alive).toBe(true)
	f2.dispose()
	f.dispose()
	expect(f.alive).toBe(false)
	expect(f2.alive).toBe(false)
	ctx.dispose()
})

test('call', async () => {
	const ctx = (await getQuickJS()).newContext()

	expect(ctx.getNumber(call(ctx, '(a, b) => a + b', undefined, ctx.newNumber(1), ctx.newNumber(2)))).toBe(3)

	const obj = ctx.newObject()
	ctx.setProp(obj, 'a', ctx.newNumber(2))
	expect(ctx.getNumber(call(ctx, '(function() { return this.a + 1; })', obj))).toBe(3)

	obj.dispose()
	ctx.dispose()
})

test('eq', async () => {
	const ctx = (await getQuickJS()).newContext()

	const math1 = ctx.unwrapResult(ctx.evalCode('Math'))
	const math2 = ctx.unwrapResult(ctx.evalCode('Math'))
	const obj = ctx.newObject()
	expect(math1 === math2).toBe(false)
	expect(eq(ctx, math1, math2)).toBe(true)
	expect(eq(ctx, math1, obj)).toBe(false)

	math1.dispose()
	math2.dispose()
	obj.dispose()
	ctx.dispose()
})

test('instanceOf', async () => {
	const ctx = (await getQuickJS()).newContext()

	const pr = ctx.unwrapResult(ctx.evalCode('Promise'))
	const func = ctx.unwrapResult(ctx.evalCode('(function() {})'))
	const p = ctx.unwrapResult(ctx.evalCode('Promise.resolve()'))
	expect(instanceOf(ctx, p, pr)).toBe(true)
	expect(instanceOf(ctx, p, func)).toBe(false)

	p.dispose()
	pr.dispose()
	func.dispose()
	ctx.dispose()
})

test('isHandleObject', async () => {
	const ctx = (await getQuickJS()).newContext()

	const obj = ctx.newObject()
	expect(isHandleObject(ctx, obj)).toBe(true)
	const func = ctx.newFunction('', () => {})
	expect(isHandleObject(ctx, func)).toBe(true)
	const array = ctx.newArray()
	expect(isHandleObject(ctx, array)).toBe(true)
	const num = ctx.newNumber(Number.NaN)
	expect(isHandleObject(ctx, num)).toBe(false)

	obj.dispose()
	func.dispose()
	array.dispose()
	ctx.dispose()
})

test('json', async () => {
	const ctx = (await getQuickJS()).newContext()

	const handle = json(ctx, {
		hoge: { foo: ['bar'] },
	})
	expect(ctx.dump(call(ctx, `a => a.hoge.foo[0] === "bar"`, undefined, handle))).toBe(true)
	expect(ctx.typeof(json(ctx, undefined))).toBe('undefined')

	handle.dispose()
	ctx.dispose()
})

test('consumeAll', async () => {
	const ctx = (await getQuickJS()).newContext()

	const o = {}

	const handles = [ctx.newObject(), ctx.newObject()]
	expect(
		consumeAll(
			handles,
			mock(() => o),
		),
	).toBe(o)
	expect(handles.every(h => !h.alive)).toBe(true)

	const handles2 = [ctx.newObject(), ctx.newObject()]
	expect(() =>
		consumeAll(handles2, () => {
			throw new Error('qes error')
		}),
	).toThrow('qes error')
	expect(handles2.every(h => !h.alive)).toBe(true)

	ctx.dispose()
})

test('mayConsume', async () => {
	const ctx = (await getQuickJS()).newContext()

	const o = {}

	const handle = ctx.newArray()
	expect(
		mayConsume(
			[handle, false],
			mock(() => o),
		),
	).toBe(o)
	expect(handle.alive).toBe(true)

	mayConsume([handle, true], () => {})
	expect(handle.alive).toBe(false)

	const handle2 = ctx.newArray()
	expect(() =>
		mayConsume([handle2, true], () => {
			throw new Error('qes error')
		}),
	).toThrow('qes error')
	expect(handle.alive).toBe(false)

	ctx.dispose()
})

test('mayConsumeAll', async () => {
	const ctx = (await getQuickJS()).newContext()

	const o = {}

	const handles: [QuickJSHandle, boolean][] = [
		[ctx.newObject(), false],
		[ctx.newObject(), true],
	]
	expect(
		mayConsumeAll(
			handles,
			mock((..._: any[]) => o),
		),
	).toBe(o)
	expect(handles[0][0].alive).toBe(true)
	expect(handles[1][0].alive).toBe(false)

	const handles2: [QuickJSHandle, boolean][] = [
		[ctx.newObject(), false],
		[ctx.newObject(), true],
	]
	expect(() =>
		mayConsumeAll(handles2, (..._args) => {
			throw new Error('qes error')
		}),
	).toThrow('qes error')
	expect(handles2[0][0].alive).toBe(true)
	expect(handles2[1][0].alive).toBe(false)

	handles[0][0].dispose()
	handles2[0][0].dispose()
	ctx.dispose()
})

test('handleFrom', async () => {
	const ctx = (await getQuickJS()).newContext()

	const handle = ctx.newObject()
	const promise = ctx.newPromise()

	expect(handleFrom(handle) === handle).toBe(true)
	expect(handleFrom(promise) === promise.handle).toBe(true)

	handle.dispose()
	promise.dispose()
	ctx.dispose()
})
