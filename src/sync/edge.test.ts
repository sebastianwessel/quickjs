import { describe, expect, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'

import { Arena } from '.'

// tests for edge cases

describe('edge cases', () => {
	// this test takes more than about 20s
	test('getter', async () => {
		const ctx = (await getQuickJS()).newContext()
		const arena = new Arena(ctx, { isMarshalable: true })

		const called: string[] = []
		const obj = { c: 0 }
		const exposed = {
			get a() {
				called.push('a')
				return {
					get b() {
						called.push('b')
						return obj
					},
				}
			},
		}
		const cb: { current?: () => any } = {}
		const register = (fn: () => any) => {
			cb.current = fn
		}

		arena.expose({ exposed, register })
		expect(called).toEqual([])

		arena.evalCode('register(() => exposed.a.b.c);')
		expect(cb.current?.()).toBe(0)
		expect(called).toEqual(['a', 'b'])

		obj.c = 1
		expect(cb.current?.()).toBe(1) // this line causes an error when context is disposed
		expect(called).toEqual(['a', 'b', 'a', 'b'])

		arena.dispose()
		// ctx.dispose(); // reports an error
	})

	test('many newFunction', async () => {
		const rt = (await getQuickJS()).newRuntime()
		const ctx = rt.newContext()
		const arena = new Arena(ctx, {
			isMarshalable: true,
			// enable this option to solve this problem
			experimentalContextEx: true,
		})

		arena.expose({
			hoge: () => {},
		})
		// should have an object as an arg
		const fn = arena.evalCode('() => { hoge([]); }')
		// error happens from 3926 times
		for (let i = 0; i < 10000; i++) {
			fn()
		}

		arena.dispose()
		ctx.dispose()
		rt.dispose()
	})
})
