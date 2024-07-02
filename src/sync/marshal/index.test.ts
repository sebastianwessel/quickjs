import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'

import { newDeferred } from '../util'
import VMMap from '../vmmap'
import { call, fn, handleFrom, instanceOf } from '../vmutil'

import marshal from '.'

test('primitive, array, object', async () => {
	const { ctx, map, marshal, dispose } = await setup()

	const target = {
		hoge: 'foo',
		foo: 1,
		aaa: [1, true, {}],
		nested: { aa: null, hoge: undefined },
	}
	const handle = marshal(target)

	expect(ctx.dump(handle)).toEqual(target)
	expect(map.size).toBe(4)
	expect(map.get(target)).toBe(handle)
	expect(map.has(target.aaa)).toBe(true)
	expect(map.has(target.nested)).toBe(true)
	expect(map.has(target.aaa[2])).toBe(true)

	dispose()
})

test('object with symbol key', async () => {
	const { ctx, marshal, dispose } = await setup()

	const target = {
		foo: 'hoge',
		[Symbol('a')]: 1,
	}
	const handle = marshal(target)
	expect(ctx.dump(call(ctx, 'a => a.foo', undefined, handle))).toBe('hoge')
	expect(ctx.dump(call(ctx, 'a => a[Object.getOwnPropertySymbols(a)[0]]', undefined, handle))).toBe(1)

	dispose()
})

test('arrow function', async () => {
	const { ctx, map, marshal, dispose } = await setup()
	const hoge = () => 'foo'
	hoge.foo = { bar: 1 }
	const handle = marshal(hoge)

	expect(ctx.typeof(handle)).toBe('function')
	expect(ctx.dump(ctx.getProp(handle, 'length'))).toBe(0)
	expect(ctx.dump(ctx.getProp(handle, 'name'))).toBe('hoge')
	const foo = ctx.getProp(handle, 'foo')
	expect(ctx.dump(foo)).toEqual({ bar: 1 })
	expect(ctx.dump(ctx.unwrapResult(ctx.callFunction(handle, ctx.undefined)))).toBe('foo')
	expect(map.size).toBe(2)
	expect(map.get(hoge)).toBe(handle)
	expect(map.has(hoge.foo)).toBe(true)

	foo.dispose()
	dispose()
})

test('function', async () => {
	const { ctx, map, marshal, dispose } = await setup()

	const bar = (a: number, b: { hoge: number }) => a + b.hoge
	const handle = marshal(bar)

	expect(ctx.typeof(handle)).toBe('function')
	expect(ctx.dump(ctx.getProp(handle, 'length'))).toBe(2)
	expect(ctx.dump(ctx.getProp(handle, 'name'))).toBe('bar')
	expect(map.size).toBe(2)
	expect(map.get(bar)).toBe(handle)
	expect(map.has(bar.prototype)).toBe(true)

	const b = ctx.unwrapResult(ctx.evalCode('({ hoge: 2 })'))
	expect(ctx.dump(ctx.unwrapResult(ctx.callFunction(handle, ctx.undefined, ctx.newNumber(1), b)))).toBe(3)

	b.dispose()
	dispose()
})

test('promise', async () => {
	const { ctx, marshal, dispose } = await setup()
	const register = fn(ctx, `promise => { promise.then(d => notify("resolve", d), d => notify("reject", d)); }`)

	let notified: any
	ctx
		.newFunction('notify', (...handles) => {
			notified = handles.map(h => ctx.dump(h))
		})
		.consume(h => {
			ctx.setProp(ctx.global, 'notify', h)
		})

	const deferred = newDeferred()
	const handle = marshal(deferred.promise)
	register(undefined, handle)

	deferred.resolve('foo')
	await deferred.promise
	expect(ctx.unwrapResult(ctx.runtime.executePendingJobs())).toBe(1)
	expect(notified).toEqual(['resolve', 'foo'])

	const deferred2 = newDeferred()
	const handle2 = marshal(deferred2.promise)
	register(undefined, handle2)

	deferred2.reject('bar')
	await expect(deferred2.promise).rejects.toBe('bar')
	// expect(ctx.unwrapResult(ctx.runtime.executePendingJobs())).toBe(1);
	expect(notified).toEqual(['reject', 'bar'])

	register.dispose()
	dispose()
})

test('class', async () => {
	const { ctx, map, marshal, dispose } = await setup()

	class A {
		a: number
		b: string

		static a = new A('a')

		constructor(b: string) {
			this.a = 100
			this.b = `${b}!`
		}

		hoge() {
			return ++this.a
		}

		get foo() {
			return this.b
		}

		set foo(b: string) {
			this.b = `${b}!`
		}
	}

	expect(A.name).toBe('A')
	const handle = marshal(A)
	if (!map) throw new Error('map is undefined')

	expect(map.size).toBe(6)
	expect(map.get(A)).toBe(handle)
	expect(map.has(A.prototype)).toBe(true)
	expect(map.has(A.a)).toBe(true)
	expect(map.has(A.prototype.hoge)).toBe(true)
	expect(map.has(Object.getOwnPropertyDescriptor(A.prototype, 'foo')?.get)).toBe(true)
	expect(map.has(Object.getOwnPropertyDescriptor(A.prototype, 'foo')?.set)).toBe(true)

	expect(ctx.typeof(handle)).toBe('function')
	expect(ctx.dump(ctx.getProp(handle, 'length'))).toBe(1)
	expect(ctx.dump(ctx.getProp(handle, 'name'))).toBe('A')
	const staticA = ctx.getProp(handle, 'a')
	expect(instanceOf(ctx, staticA, handle)).toBe(true)
	expect(ctx.dump(ctx.getProp(staticA, 'a'))).toBe(100)
	expect(ctx.dump(ctx.getProp(staticA, 'b'))).toBe('a!')

	const newA = ctx.unwrapResult(ctx.evalCode(`A => new A("foo")`))
	const instance = ctx.unwrapResult(ctx.callFunction(newA, ctx.undefined, handle))
	expect(instanceOf(ctx, instance, handle)).toBe(true)
	expect(ctx.dump(ctx.getProp(instance, 'a'))).toBe(100)
	expect(ctx.dump(ctx.getProp(instance, 'b'))).toBe('foo!')
	const methodHoge = ctx.getProp(instance, 'hoge')
	expect(ctx.dump(ctx.unwrapResult(ctx.callFunction(methodHoge, instance)))).toBe(101)
	expect(ctx.dump(ctx.getProp(instance, 'a'))).toBe(100) // not synced

	const getter = ctx.unwrapResult(ctx.evalCode('a => a.foo'))
	const setter = ctx.unwrapResult(ctx.evalCode('(a, b) => a.foo = b'))
	expect(ctx.dump(ctx.unwrapResult(ctx.callFunction(getter, ctx.undefined, instance)))).toBe('foo!')
	ctx.unwrapResult(ctx.callFunction(setter, ctx.undefined, instance, ctx.newString('b')))
	expect(ctx.dump(ctx.getProp(instance, 'b'))).toBe('foo!') // not synced

	staticA.dispose()
	newA.dispose()
	instance.dispose()
	methodHoge.dispose()
	getter.dispose()
	setter.dispose()
	dispose()
})

test('date', async () => {
	const { ctx, map, marshal, dispose } = await setup()

	const date = new Date(2022, 7, 26)
	const handle = marshal(date)
	if (!map) throw new Error('map is undefined')

	expect(map.size).toBe(1)
	expect(map.get(date)).toBe(handle)

	expect(ctx.dump(call(ctx, 'd => d instanceof Date', undefined, handle))).toBe(true)
	expect(ctx.dump(call(ctx, 'd => d.getTime()', undefined, handle))).toBe(date.getTime())

	dispose()
})

test('marshalable', async () => {
	const isMarshalable = mock((a: any) => a !== globalThis)
	const { ctx, marshal, dispose } = await setup({
		isMarshalable,
	})

	const handle = marshal({ a: globalThis, b: 1 })

	expect(ctx.dump(handle)).toEqual({ a: undefined, b: 1 })
	expect(isMarshalable).toBeCalledWith(globalThis)
	expect(isMarshalable).toReturnWith(false)

	dispose()
})

test('marshalable json', async () => {
	const isMarshalable = mock(() => 'json' as const)
	const { ctx, marshal, dispose } = await setup({
		isMarshalable,
	})

	class Hoge {}
	const target = {
		a: { c: () => 1, d: new Date(), e: [() => 1, 1, new Hoge()] },
		b: 1,
	}
	const handle = marshal(target)

	expect(ctx.dump(handle)).toEqual({
		a: { d: target.a.d.toISOString(), e: [null, 1, {}] },
		b: 1,
	})
	expect(isMarshalable).toBeCalledTimes(1)
	expect(isMarshalable).toBeCalledWith(target)
	expect(isMarshalable).toReturnWith('json')

	dispose()
})

const setup = async ({
	isMarshalable,
}: {
	isMarshalable?: (target: any) => boolean | 'json'
} = {}) => {
	const ctx = (await getQuickJS()).newContext()
	const map = new VMMap(ctx)
	return {
		ctx,
		map,
		marshal: (v: any) =>
			marshal(v, {
				ctx: ctx,
				unmarshal: h => map.getByHandle(h) ?? ctx.dump(h),
				isMarshalable,
				pre: (t, d) => {
					const h = handleFrom(d)
					map.set(t, h)
					return h
				},
				find: t => map.get(t),
			}),
		dispose: () => {
			map.dispose()
			ctx.dispose()
		},
	}
}
