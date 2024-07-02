import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'

import { call } from '../vmutil.js'

import marshalCustom, { defaultCustom } from './custom.js'

test('symbol', async () => {
	const ctx = (await getQuickJS()).newContext()
	const pre = mock()
	const sym = Symbol('foobar')

	const marshal = (t: unknown) => marshalCustom(ctx, t, pre, defaultCustom)

	expect(marshal({})).toBe(undefined)
	expect(pre).toBeCalledTimes(0)

	const handle = marshal(sym)
	if (!handle) throw new Error('handle is undefined')
	expect(ctx.typeof(handle)).toBe('symbol')
	expect(ctx.getString(ctx.getProp(handle, 'description'))).toBe('foobar')
	expect(pre).toHaveReturnedTimes(1)
	expect(pre.mock.calls[0][0]).toBe(sym)
	expect(pre.mock.calls[0][1] === handle).toBe(true)

	handle.dispose()
	ctx.dispose()
})

test('date', async () => {
	const ctx = (await getQuickJS()).newContext()
	const pre = mock()
	const date = new Date(2022, 7, 26)

	const marshal = (t: unknown) => marshalCustom(ctx, t, pre, defaultCustom)

	expect(marshal({})).toBe(undefined)
	expect(pre).toBeCalledTimes(0)

	const handle = marshal(date)
	if (!handle) throw new Error('handle is undefined')
	expect(ctx.dump(call(ctx, 'd => d instanceof Date', undefined, handle))).toBe(true)
	expect(ctx.dump(call(ctx, 'd => d.getTime()', undefined, handle))).toBe(date.getTime())
	expect(pre).toHaveReturnedTimes(1)
	expect(pre.mock.calls[0][0]).toBe(date)
	expect(pre.mock.calls[0][1] === handle).toBe(true)

	handle.dispose()
	ctx.dispose()
})
