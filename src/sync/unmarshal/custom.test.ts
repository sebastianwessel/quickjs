import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'
import { expect, test, vi } from 'vitest'

import unmarshalCustom, { defaultCustom } from './custom.js'

test('symbol', async () => {
	const ctx = (await getQuickJS()).newContext()
	const pre = vi.fn()
	const obj = ctx.newObject()
	const handle = ctx.unwrapResult(ctx.evalCode(`Symbol("foobar")`))

	const unmarshal = (h: QuickJSHandle): any => unmarshalCustom(ctx, h, pre, defaultCustom)

	expect(unmarshal(obj)).toBe(undefined)
	expect(pre).toBeCalledTimes(0)

	const sym = unmarshal(handle)
	expect(typeof sym).toBe('symbol')
	expect((sym as any).description).toBe('foobar')
	expect(pre).toReturnTimes(1)
	expect(pre.mock.calls[0][0]).toBe(sym)
	expect(pre.mock.calls[0][1] === handle).toBe(true)

	handle.dispose()
	obj.dispose()
	ctx.dispose()
})

test('date', async () => {
	const ctx = (await getQuickJS()).newContext()
	const pre = vi.fn()
	const obj = ctx.newObject()
	const handle = ctx.unwrapResult(ctx.evalCode('new Date(2022, 7, 26)'))

	const unmarshal = (h: QuickJSHandle): any => unmarshalCustom(ctx, h, pre, defaultCustom)

	expect(unmarshal(obj)).toBe(undefined)
	expect(pre).toBeCalledTimes(0)

	const date = unmarshal(handle)
	expect(date).toBeInstanceOf(Date)
	expect(date.getTime()).toBe(new Date(2022, 7, 26).getTime())
	expect(pre).toReturnTimes(1)
	expect(pre.mock.calls[0][0]).toBe(date)
	expect(pre.mock.calls[0][1] === handle).toBe(true)

	handle.dispose()
	obj.dispose()
	ctx.dispose()
})
