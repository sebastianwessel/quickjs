import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'
import { expect, test, vi } from 'vitest'

import { call, eq, json } from '../vmutil'

import marshalFunction from './function'

test('normal func', async () => {
	const ctx = (await getQuickJS()).newContext()

	const marshal = vi.fn(v => json(ctx, v))
	const unmarshal = vi.fn(v => (eq(ctx, v, ctx.global) ? undefined : ctx.dump(v)))
	const preMarshal = vi.fn((_, a) => a)
	const innerfn = vi.fn((..._args: any[]) => 'hoge')
	const fn = (...args: any[]) => innerfn(...args)

	const handle = marshalFunction(ctx, fn, marshal, unmarshal, preMarshal)
	if (!handle) throw new Error('handle is undefined')

	expect(marshal.mock.calls).toEqual([['length'], [0], ['name'], ['fn']]) // fn.length, fn.name
	expect(preMarshal.mock.calls).toEqual([[fn, handle]]) // fn.length, fn.name
	expect(ctx.typeof(handle)).toBe('function')
	expect(ctx.dump(ctx.getProp(handle, 'length'))).toBe(0)
	expect(ctx.dump(ctx.getProp(handle, 'name'))).toBe('fn')

	const result = ctx.unwrapResult(ctx.callFunction(handle, ctx.undefined, ctx.newNumber(1), ctx.true))

	expect(ctx.dump(result)).toBe('hoge')
	expect(innerfn).toBeCalledWith(1, true)
	expect(marshal).toHaveBeenLastCalledWith('hoge')
	expect(unmarshal).toBeCalledTimes(3)
	expect(unmarshal.mock.results[0].value).toBe(undefined) // this
	expect(unmarshal.mock.results[1].value).toBe(1)
	expect(unmarshal.mock.results[2].value).toBe(true)

	handle.dispose()
	ctx.dispose()
})

test('func which has properties', async () => {
	const ctx = (await getQuickJS()).newContext()
	const marshal = vi.fn(v => json(ctx, v))

	const fn = () => {}
	fn.hoge = 'foo'

	const handle = marshalFunction(
		ctx,
		fn,
		marshal,
		v => ctx.dump(v),
		(_, a) => a,
	)
	if (!handle) throw new Error('handle is undefined')

	expect(ctx.typeof(handle)).toBe('function')
	expect(ctx.dump(ctx.getProp(handle, 'hoge'))).toBe('foo')
	expect(marshal).toBeCalledWith('foo')

	handle.dispose()
	ctx.dispose()
})

test('class', async () => {
	const ctx = (await getQuickJS()).newContext()

	const disposables: QuickJSHandle[] = []
	const marshal = (v: any) => {
		if (typeof v === 'string') return ctx.newString(v)
		if (typeof v === 'number') return ctx.newNumber(v)
		if (typeof v === 'object') {
			const obj = ctx.newObject()
			disposables.push(obj)
			return obj
		}
		return ctx.null
	}
	const unmarshal = (v: QuickJSHandle) => ctx.dump(v)

	class A {
		a: number

		constructor(a: number) {
			this.a = a
		}
	}

	const handle = marshalFunction(ctx, A, marshal, unmarshal, (_, a) => a)
	if (!handle) throw new Error('handle is undefined')

	const newA = ctx.unwrapResult(ctx.evalCode('A => new A(100)'))
	const instance = ctx.unwrapResult(ctx.callFunction(newA, ctx.undefined, handle))

	expect(ctx.dump(ctx.getProp(handle, 'name'))).toBe('A')
	expect(ctx.dump(ctx.getProp(handle, 'length'))).toBe(1)
	expect(ctx.dump(call(ctx, '(cls, i) => i instanceof cls', undefined, handle, instance))).toBe(true)
	expect(ctx.dump(ctx.getProp(instance, 'a'))).toBe(100)

	disposables.forEach(d => d.dispose())
	instance.dispose()
	newA.dispose()
	handle.dispose()
	ctx.dispose()
})

test('preApply', async () => {
	const ctx = (await getQuickJS()).newContext()

	const marshal = (v: any) => {
		if (typeof v === 'string') return ctx.newString(v)
		if (typeof v === 'number') return ctx.newNumber(v)
		return ctx.null
	}
	const unmarshal = (v: QuickJSHandle) => (ctx.typeof(v) === 'object' ? that : ctx.dump(v))
	const preApply = vi.fn((a: Function, b: any, c: any[]) => `${a.apply(b, c)}!`)
	const that = {}
	const thatHandle = ctx.newObject()

	const fn = () => 'foo'
	const handle = marshalFunction(ctx, fn, marshal, unmarshal, (_, a) => a, preApply)
	if (!handle) throw new Error('handle is undefined')

	expect(preApply).toBeCalledTimes(0)

	const res = ctx.unwrapResult(ctx.callFunction(handle, thatHandle, ctx.newNumber(100), ctx.newString('hoge')))

	expect(preApply).toBeCalledTimes(1)
	expect(preApply).toBeCalledWith(fn, that, [100, 'hoge'])
	expect(ctx.dump(res)).toBe('foo!')

	thatHandle.dispose()
	handle.dispose()
	ctx.dispose()
})

test('undefined', async () => {
	const ctx = (await getQuickJS()).newContext()
	const f = vi.fn()

	expect(marshalFunction(ctx, undefined, f, f, f)).toBe(undefined)
	expect(marshalFunction(ctx, null, f, f, f)).toBe(undefined)
	expect(marshalFunction(ctx, false, f, f, f)).toBe(undefined)
	expect(marshalFunction(ctx, true, f, f, f)).toBe(undefined)
	expect(marshalFunction(ctx, 1, f, f, f)).toBe(undefined)
	expect(marshalFunction(ctx, [1], f, f, f)).toBe(undefined)
	expect(marshalFunction(ctx, { a: 1 }, f, f, f)).toBe(undefined)
	expect(f).toBeCalledTimes(0)

	ctx.dispose()
})
