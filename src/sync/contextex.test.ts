import { getQuickJS } from 'quickjs-emscripten'
import { expect, test, vi } from 'vitest'

import { ContextEx, wrapContext } from './contextex.js'

test('wrapContext', async () => {
	const ctx = (await getQuickJS()).newContext()
	const c = wrapContext(ctx)
	c.disposeEx?.()
	ctx.dispose()
})

test('ContextEx', async () => {
	try {
		const ctx = (await getQuickJS()).newContext()
		const spy = vi.spyOn(ctx, 'newFunction')
		const ctxex = new ContextEx(ctx)

		const handle = ctxex.newFunction('', function (handle) {
			expect(ctx.getString(this)).toBe('this')
			expect(ctx.getNumber(handle)).toBe(100)
			return ctx.newString('result')
		})

		for (let i = 0; i < 10000; i++) {
			const res = ctx.unwrapResult(ctx.callFunction(handle, ctx.newString('this'), ctx.newNumber(100)))
			expect(ctx.getString(res)).toBe('result')
			res.dispose()
		}
		expect(spy).toBeCalledTimes(1)

		handle.dispose()
		ctxex.disposeEx()
		ctx.dispose()
	} catch (err) {
		// prevent freezing node when printing QuickJSContext
		;(err as any).context = undefined
		console.error(err)
		throw err
	}
})
