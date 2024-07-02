import { describe, expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'

import { isWrapped } from './wrapper.js'

import { Arena } from '.'

describe('readme', () => {
	test('first', async () => {
		class Cls {
			field = 0

			method() {
				return ++this.field
			}
		}

		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		// We can pass objects to the VM and run code safely
		const exposed = {
			Cls,
			cls: new Cls(),
			syncedCls: arena.sync(new Cls()),
		}
		arena.expose(exposed)

		expect(arena.evalCode('cls instanceof Cls')).toBe(true)
		expect(arena.evalCode('cls.field')).toBe(0)
		expect(arena.evalCode('cls.method()')).toBe(1)
		expect(arena.evalCode('cls.field')).toBe(1)

		expect(arena.evalCode('syncedCls.field')).toBe(0)
		expect(exposed.syncedCls.method()).toBe(1)
		expect(arena.evalCode('syncedCls.field')).toBe(1)

		arena.dispose()
		ctx.dispose()
	})

	test('usage', async () => {
		const quickjs = await getQuickJS()
		const ctx = quickjs.newContext()

		// init Arena
		// ⚠️ Marshaling is opt-in for security reasons.
		// ⚠️ Be careful when activating marshalling.
		const arena = new Arena(ctx, { isMarshalable: true })

		// expose objects as global objects in QuickJS VM
		const log = mock()
		arena.expose({
			console: { log },
		})
		arena.evalCode(`console.log("hello, world");`) // run console.log
		expect(log).toBeCalledWith('hello, world')
		arena.evalCode('1 + 1') // 2

		// expose objects but also enable sync
		const data = arena.sync({ hoge: 'foo' })
		arena.expose({ data })

		arena.evalCode(`data.hoge = "bar"`)
		// eval code and operations to exposed objects are automatically synced
		expect(data.hoge).toBe('bar')
		data.hoge = 'changed!'
		expect(arena.evalCode('data.hoge')).toBe('changed!')

		// Don't forget calling arena.dispose() before disposing QuickJS VM!
		arena.dispose()
		ctx.dispose()
	})
})

describe('evalCode', () => {
	test('simple object and function', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const result = arena.evalCode(
			`({
        a: 1,
        b: a => Math.floor(a),
        c: () => { throw new Error("hoge") },
        d: (yourFavoriteNumber) => ({
          myFavoriteNumber: 42,
          yourFavoriteNumber,
        }),
        get e() {
          return { a: 1 };
        }
      })`,
		)
		expect(result).toEqual({
			a: 1,
			b: expect.any(Function),
			c: expect.any(Function),
			d: expect.any(Function),
			e: { a: 1 },
		})
		expect(result.b(1.1)).toBe(1)
		expect(() => result.c()).toThrow('hoge')
		expect(result.d(1)).toStrictEqual({
			myFavoriteNumber: 42,
			yourFavoriteNumber: 1,
		})
		expect(result.e).toStrictEqual({ a: 1 })

		arena.dispose()
		ctx.dispose()
	})

	test('Math', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const VMMath = arena.evalCode('Math') as Math
		expect(VMMath.floor(1.1)).toBe(1)

		arena.dispose()
		ctx.dispose()
	})

	test('Date', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const date = new Date(2022, 7, 26)
		expect(arena.evalCode('new Date(2022, 7, 26)')).toEqual(date)
		expect(arena.evalCode('d => d instanceof Date')(date)).toBe(true)
		expect(arena.evalCode('d => d.getTime()')(date)).toBe(date.getTime())

		arena.dispose()
		ctx.dispose()
	})

	test('class', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const instance = arena.evalCode(`{
      globalThis.Cls = class D {
        constructor(a) {
          this.a = a + 1;
        }
        foo() {
          return ++this.a;
        }
      };

      new Cls(100);
    }`)
		const Cls = arena.evalCode('globalThis.Cls')
		expect(instance instanceof Cls).toBe(true)
		expect(instance.a).toBe(101)
		expect(instance.foo()).toBe(102)
		expect(instance.a).toBe(102)

		arena.dispose()
		ctx.dispose()
	})

	test('obj', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const obj = arena.evalCode('globalThis.AAA = { a: 1 }')

		expect(obj).toEqual({ a: 1 })
		expect(arena.evalCode('AAA.a')).toBe(1)
		obj.a = 2
		expect(obj).toEqual({ a: 2 })
		expect(arena.evalCode('AAA.a')).toBe(2)

		arena.dispose()
		ctx.dispose()
	})

	test('promise', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const [promise, resolve] = arena.evalCode<[Promise<string>, (d: string) => void]>(`
      let resolve;
      const promise = new Promise(r => {
        resolve = r;
      }).then(d => d + "!");
      [promise, resolve]
    `)
		expect(promise).instanceOf(Promise)
		expect(isWrapped(arena._unwrapIfNotSynced(promise), arena._symbol)).toBe(false)

		resolve('hoge')
		expect(arena.executePendingJobs()).toBe(2)
		expect(await promise).toBe('hoge!')

		arena.dispose()
		ctx.dispose()
	})

	test('promise2', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const deferred: { resolve?: (s: string) => void } = {}
		const promise = new Promise(resolve => {
			deferred.resolve = resolve
		})
		const res = mock()
		arena.evalCode(`(p, r) => { p.then(d => { r(d + "!"); }); }`)(promise, res)
		deferred.resolve?.('hoge')
		await promise
		expect(arena.executePendingJobs()).toBe(1)
		expect(res).toBeCalledWith('hoge!')
		await new Promise(resolve => setTimeout(resolve, 100))
		arena.dispose()
		ctx.dispose()
	})

	test('async function', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const consolelog = mock()
		arena.expose({
			console: {
				log: consolelog,
			},
		})

		arena.evalCode(`
      const someAsyncOperation = async () => "hello";
      const execute = async () => {
        try {
          const res = await someAsyncOperation();
          console.log(res);
        } catch (e) {
          console.log(e);
        }
      };
      execute();
    `)
		expect(consolelog).toBeCalledTimes(0)
		expect(arena.executePendingJobs()).toBe(2)

		arena.executePendingJobs()

		expect(consolelog).toBeCalledTimes(1)
		expect(consolelog).toBeCalledWith('hello')
		expect(arena.executePendingJobs()).toBe(0)

		arena.dispose()
		ctx.dispose()
	})
})

describe('expose without sync', () => {
	test('simple object and function', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const obj = {
			a: 1,
			b: (a: number) => Math.floor(a),
			c: () => {
				throw new Error('hoge')
			},
			d: (yourFavoriteNumber: number) => ({
				myFavoriteNumber: 42,
				yourFavoriteNumber,
			}),
			get e() {
				return { a: 1 }
			},
		}
		arena.expose({
			obj,
		})

		expect(arena.evalCode('obj')).toBe(obj)
		expect(arena.evalCode('obj.a')).toBe(1)
		expect(arena.evalCode('obj.b(1.1)')).toBe(1)
		expect(() => arena.evalCode('obj.c()')).toThrow('hoge')
		expect(arena.evalCode('obj.d(1)')).toStrictEqual({
			myFavoriteNumber: 42,
			yourFavoriteNumber: 1,
		})
		expect(arena.evalCode('obj.e')).toStrictEqual({ a: 1 })

		arena.dispose()
		ctx.dispose()
	})

	test('Math', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		arena.expose({ Math2: Math })
		expect(arena.evalCode('Math')).not.toBe(Math)
		expect(arena.evalCode('Math2')).toBe(Math)
		expect(arena.evalCode('Math2.floor(1.1)')).toBe(1)

		arena.dispose()
		ctx.dispose()
	})

	test('class', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		class D {
			a: number

			constructor(a: number) {
				this.a = a + 1
			}

			foo() {
				return ++this.a
			}
		}

		const d = new D(100)
		arena.expose({ D, d })
		expect(arena.evalCode('D')).toBe(D)
		expect(arena.evalCode('d')).toBe(d)
		expect(arena.evalCode('d instanceof D')).toBe(true)
		expect(arena.evalCode('d.a')).toBe(101)
		expect(arena.evalCode('d.foo()')).toBe(102)
		expect(arena.evalCode('d.a')).toBe(102)

		arena.dispose()
		ctx.dispose()
	})

	test('object and function', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const obj = {
			a: 1,
			b: (a: number) => Math.floor(a),
			c() {
				return this.a++
			},
		}
		arena.expose({ obj })

		expect(arena.evalCode('obj')).toBe(obj)
		expect(arena.evalCode('obj.a')).toBe(1)
		expect(arena.evalCode('obj.b')).toBe(obj.b)
		expect(arena.evalCode('obj.b(1.1)')).toBe(1)
		expect(arena.evalCode('obj.c')).toBe(obj.c)
		expect(arena.evalCode('obj.c()')).toBe(1)
		expect(arena.evalCode('obj.a')).toBe(2)
		expect(obj.a).toBe(2)
		expect(arena.evalCode('obj.c()')).toBe(2)
		expect(arena.evalCode('obj.a')).toBe(3)
		expect(obj.a).toBe(3)

		obj.a = 10
		expect(obj.a).toBe(10)
		expect(arena.evalCode('obj.a')).toBe(3) // not affected

		arena.evalCode('obj.a = 100')
		expect(obj.a).toBe(10) // not affected
		expect(arena.evalCode('obj.a')).toBe(100)

		arena.dispose()
		ctx.dispose()
	})
})

describe('expose with sync', () => {
	test('sync before expose', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const obj = {
			a: 1,
			b: (a: number) => Math.floor(a),
			c() {
				return this.a++
			},
		}
		const obj2 = arena.sync(obj)
		arena.expose({ obj: obj2 })

		const obj3 = arena.evalCode('obj')
		expect(obj3).toBe(obj2)
		expect(arena.evalCode('obj.c')).not.toBe(obj.c) // wrapped object
		expect(arena.evalCode('obj.b')).not.toBe(obj2.b) // wrapped object
		expect(arena.evalCode('obj.b')).not.toBe(obj3.b) // wrapped object
		expect(arena.evalCode('obj.b(1.1)')).toBe(1)
		expect(arena.evalCode('obj.a')).toBe(1)
		expect(arena.evalCode('obj.c')).not.toBe(obj.c) // wrapped object
		expect(arena.evalCode('obj.c')).not.toBe(obj2.c) // wrapped object
		expect(arena.evalCode('obj.c')).not.toBe(obj3.c) // wrapped object
		expect(arena.evalCode('obj.c()')).toBe(1)
		expect(arena.evalCode('obj.a')).toBe(2)
		expect(obj.a).toBe(2)
		expect(arena.evalCode('obj.c()')).toBe(2)
		expect(arena.evalCode('obj.a')).toBe(3)
		expect(obj.a).toBe(3)

		expect(obj).not.toBe(obj2)
		obj2.a = 10
		expect(obj.a).toBe(10)
		expect(arena.evalCode('obj.a')).toBe(10) // affected

		arena.evalCode('obj.a = 100')
		expect(obj.a).toBe(100) // affected
		expect(arena.evalCode('obj.a')).toBe(100)

		arena.dispose()
		ctx.dispose()
	})

	test('sync after expose', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const obj = {
			a: 1,
			b: (a: number) => Math.floor(a),
			c() {
				return this.a++
			},
		}
		arena.expose({ obj })
		const obj2 = arena.sync(obj)

		const obj3 = arena.evalCode('obj')
		expect(obj3).not.toBe(obj) // wrapped object
		expect(obj3).not.toBe(obj2) // wrapped object
		expect(arena.evalCode('obj.c')).not.toBe(obj.c) // wrapped object
		expect(arena.evalCode('obj.b')).not.toBe(obj2.b) // wrapped object
		expect(arena.evalCode('obj.b')).not.toBe(obj3.b) // wrapped object
		expect(arena.evalCode('obj.b(1.1)')).toBe(1)
		expect(arena.evalCode('obj.a')).toBe(1)
		expect(arena.evalCode('obj.c')).not.toBe(obj.c) // wrapped object
		expect(arena.evalCode('obj.c')).not.toBe(obj2.c) // wrapped object
		expect(arena.evalCode('obj.c')).not.toBe(obj3.c) // wrapped object
		expect(arena.evalCode('obj.c()')).toBe(1)
		expect(arena.evalCode('obj.a')).toBe(2)
		expect(obj.a).toBe(2)
		expect(arena.evalCode('obj.c()')).toBe(2)
		expect(arena.evalCode('obj.a')).toBe(3)
		expect(obj.a).toBe(3)

		expect(obj).not.toBe(obj2)
		obj2.a = 10
		expect(obj.a).toBe(10)
		expect(arena.evalCode('obj.a')).toBe(10) // affected

		arena.evalCode('obj.a = 100')
		expect(obj.a).toBe(100) // affected
		expect(arena.evalCode('obj.a')).toBe(100)

		arena.dispose()
		ctx.dispose()
	})
})

test('evalCode -> expose', async () => {
	const ctx = (await getQuickJS()).newContext()
	const arena = new Arena(ctx, { isMarshalable: true })

	const obj = arena.evalCode('({ a: 1, b: 1 })')
	arena.expose({ obj })

	expect(obj).toBe(obj)
	expect(obj.a).toBe(1)
	expect(arena.evalCode('obj.a')).toBe(1)
	expect(obj.b).toBe(1)
	expect(arena.evalCode('obj.b')).toBe(1)

	obj.a = 2

	expect(obj.a).toBe(2)
	expect(arena.evalCode('obj.a')).toBe(2)
	expect(obj.b).toBe(1)
	expect(arena.evalCode('obj.b')).toBe(1)

	expect(arena.evalCode('obj.b = 2')).toBe(2)

	expect(obj.a).toBe(2)
	expect(arena.evalCode('obj.a')).toBe(2)
	expect(obj.b).toBe(2)
	expect(arena.evalCode('obj.b')).toBe(2)

	arena.dispose()
	ctx.dispose()
})

test('expose -> evalCode', async () => {
	const ctx = (await getQuickJS()).newContext()
	const arena = new Arena(ctx, { isMarshalable: true })

	const obj = { a: 1 }
	arena.expose({ obj })
	const obj2 = arena.evalCode('obj')

	expect(obj2).toBe(obj)

	obj2.a = 2
	expect(obj.a).toBe(2)
	expect(arena.evalCode('obj.a')).toBe(1)

	arena.evalCode('obj.a = 3')
	expect(obj.a).toBe(2)
	expect(arena.evalCode('obj.a')).toBe(3)

	arena.dispose()
	ctx.dispose()
})

test('evalCode -> expose -> evalCode', async () => {
	const ctx = (await getQuickJS()).newContext()
	const arena = new Arena(ctx, { isMarshalable: true })

	const obj = [1]
	expect(arena.evalCode('a => a[0] + 10')(obj)).toBe(11)
	arena.expose({ obj })
	expect(arena.evalCode('obj')).toBe(obj)

	arena.dispose()
	ctx.dispose()
})

test('register and unregister', async () => {
	const ctx = (await getQuickJS()).newContext()
	const arena = new Arena(ctx, { isMarshalable: true, registeredObjects: [] })

	arena.register(Math, 'Math')
	expect(arena.evalCode('Math')).toBe(Math)
	expect(arena.evalCode('m => m === Math')(Math)).toBe(true)

	arena.unregister(Math)
	expect(arena.evalCode('Math')).not.toBe(Math)
	expect(arena.evalCode('m => m === Math')(Math)).toBe(false)

	arena.register(Error, 'Error')
	arena.register(Error.prototype, 'Error.prototype')
	expect(arena.evalCode('new Error()')).toBeInstanceOf(Error)

	arena.dispose()
	ctx.dispose()
})

test('registeredObjects option', async () => {
	const ctx = (await getQuickJS()).newContext()
	const arena = new Arena(ctx, {
		isMarshalable: true,
		registeredObjects: [[Symbol.iterator, 'Symbol.iterator']],
	})

	expect(arena.evalCode('Symbol.iterator')).toBe(Symbol.iterator)
	expect(arena.evalCode('s => s === Symbol.iterator')(Symbol.iterator)).toBe(true)

	arena.dispose()
	ctx.dispose()
})

describe('isMarshalable option', () => {
	test('false', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: false })

		expect(arena.evalCode('s => s === undefined')(globalThis)).toBe(true)
		expect(arena.evalCode('s => s === undefined')({})).toBe(true)
		arena.expose({ aaa: globalThis })
		expect(arena.evalCode('aaa')).toBeUndefined()

		arena.dispose()
		ctx.dispose()
	})

	test('json', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: 'json' })

		const obj = { a: () => {}, b: new Date(), c: [() => {}, 1] }
		const objJSON = { b: obj.b.toISOString(), c: [null, 1] }
		const objJSON2 = arena.evalCode('a => a')(obj)
		expect(objJSON2).toStrictEqual(objJSON)
		arena.expose({ obj })
		const exposedObj = arena.evalCode('obj')
		expect(exposedObj).toStrictEqual(objJSON)
		expect(exposedObj).not.toBe(objJSON2)

		arena.dispose()
		ctx.dispose()
	})

	test('conditional', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, {
			isMarshalable: o => o !== globalThis,
		})

		const obj = { a: 1 }
		expect(arena.evalCode('s => s === undefined')(globalThis)).toBe(true)
		expect(arena.evalCode('s => s === undefined')(obj)).toBe(false)
		arena.expose({ aaa: globalThis, bbb: obj })
		expect(arena.evalCode('aaa')).toBeUndefined()
		expect(arena.evalCode('bbb')).toBe(obj)

		arena.dispose()
		ctx.dispose()
	})
})
