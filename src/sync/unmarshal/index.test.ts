import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'

import VMMap from '../vmmap.js'
import { json } from '../vmutil.js'

import unmarshal from '.'

test('primitive, array, object', async () => {
	const { ctx, unmarshal, marshal, map, dispose } = await setup()

	const handle = ctx.unwrapResult(
		ctx.evalCode(`({
      hoge: "foo",
      foo: 1,
      aaa: [1, true, {}],
      nested: { aa: null, hoge: undefined },
      bbb: () => "bar"
    })`),
	)
	const target = unmarshal(handle)

	expect(target).toEqual({
		hoge: 'foo',
		foo: 1,
		aaa: [1, true, {}],
		nested: { aa: null, hoge: undefined },
		bbb: expect.any(Function),
	})
	expect(map.size).toBe(5)
	expect(map.getByHandle(handle)).toBe(target)
	ctx.getProp(handle, 'aaa').consume(h => expect(map.getByHandle(h)).toBe(target.aaa))
	ctx
		.getProp(handle, 'aaa')
		.consume(h => ctx.getProp(h, 2))
		.consume(h => expect(map.getByHandle(h)).toBe(target.aaa[2]))
	ctx.getProp(handle, 'nested').consume(h => expect(map.getByHandle(h)).toBe(target.nested))
	ctx.getProp(handle, 'bbb').consume(h => expect(map.getByHandle(h)).toBe(target.bbb))

	expect(marshal).toBeCalledTimes(0)
	expect(target.bbb()).toBe('bar')
	expect(marshal).toBeCalledTimes(1)
	expect(marshal).toBeCalledWith(target) // thisArg of target.bbb()

	dispose()
})

test('object with symbol key', async () => {
	const { ctx, unmarshal, dispose } = await setup()

	const handle = ctx.unwrapResult(
		ctx.evalCode(`({
      hoge: "foo",
      [Symbol("a")]: "bar"
    })`),
	)
	const target = unmarshal(handle)

	expect(target.hoge).toBe('foo')
	expect(target[Object.getOwnPropertySymbols(target)[0]]).toBe('bar')

	dispose()
})

test('function', async () => {
	const { ctx, unmarshal, marshal, map, dispose } = await setup()

	const handle = ctx.unwrapResult(ctx.evalCode(`(function(a) { return a.a + "!"; })`))
	const func = unmarshal(handle)
	const arg = { a: 'hoge' }
	expect(func(arg)).toBe('hoge!')
	expect(marshal).toBeCalledTimes(2)
	expect(marshal).toBeCalledWith(undefined) // this
	expect(marshal).toBeCalledWith(arg) // arg
	expect(map.size).toBe(3)
	expect(map.getByHandle(handle)).toBe(func)
	expect(map.has(func)).toBe(true)
	expect(map.has(func.prototype)).toBe(true)
	expect(map.has(arg)).toBe(true)

	dispose()
})

test('promise', async () => {
	const { ctx, unmarshal, dispose } = await setup()

	const deferred = ctx.newPromise()
	const promise = unmarshal(deferred.handle)
	deferred.resolve(ctx.newString('resolved!'))
	ctx.runtime.executePendingJobs()
	await expect(promise).resolves.toBe('resolved!')

	const deferred2 = ctx.newPromise()
	const promise2 = unmarshal(deferred2.handle)
	deferred2.reject(ctx.newString('rejected!'))
	ctx.runtime.executePendingJobs()
	await expect(promise2).rejects.toBe('rejected!')

	deferred.dispose()
	deferred2.dispose()
	dispose()
})

test('class', async () => {
	const { ctx, unmarshal, dispose } = await setup()

	const handle = ctx.unwrapResult(
		ctx.evalCode(`{
      class Cls {
        static hoge = "foo";

        constructor(a) {
          this.foo = a + 2;
        }
      }
      Cls.foo = new Cls(1);

      Cls
    }`),
	)
	const Cls = unmarshal(handle)

	expect(Cls.hoge).toBe('foo')
	expect(Cls.foo).toBeInstanceOf(Cls)
	expect(Cls.foo.foo).toBe(3)
	const cls = new Cls(2)
	expect(cls).toBeInstanceOf(Cls)
	expect(cls.foo).toBe(4)

	handle.dispose()
	dispose()
})

test('date', async () => {
	const { ctx, unmarshal, dispose } = await setup()

	const handle = ctx.unwrapResult(ctx.evalCode('new Date(2022, 7, 26)'))
	const date = unmarshal(handle)
	const expected = new Date(2022, 7, 26)

	expect(date).toBeInstanceOf(Date)
	expect(date.getTime()).toBe(expected.getTime())

	handle.dispose()
	dispose()
})

const setup = async () => {
	const ctx = (await getQuickJS()).newContext()
	const map = new VMMap(ctx)
	const disposables: QuickJSHandle[] = []
	const marshal = mock((target: unknown): [QuickJSHandle, boolean] => {
		const handle = map.get(target)
		if (handle) return [handle, false]

		const handle2 =
			typeof target === 'function'
				? ctx.newFunction(target.name, (...handles) => {
						target(...handles.map(h => ctx.dump(h)))
					})
				: json(ctx, target)
		const ty = ctx.typeof(handle2)
		if (ty === 'object' || ty === 'function') map.set(target, handle2)
		return [handle2, false]
	})

	return {
		ctx,
		map,
		unmarshal: (handle: QuickJSHandle) =>
			unmarshal(handle, {
				find: h => map.getByHandle(h),
				marshal,
				pre: (t, h) => {
					map.set(t, h)
					return t
				},
				ctx: ctx,
			}),
		marshal,
		dispose: () => {
			disposables.forEach(d => d.dispose())
			map.dispose()
			ctx.dispose()
		},
	}
}
