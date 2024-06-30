import { getQuickJS } from 'quickjs-emscripten'
import { expect, test } from 'vitest'

import { arrayBufferEq, eq } from '../vmutil'

import marshalPrimitive from './primitive'

test('works', async () => {
	const ctx = (await getQuickJS()).newContext()

	expect(marshalPrimitive(ctx, undefined)).toBe(ctx.undefined)
	expect(marshalPrimitive(ctx, null)).toBe(ctx.null)
	expect(marshalPrimitive(ctx, false)).toBe(ctx.false)
	expect(marshalPrimitive(ctx, true)).toBe(ctx.true)
	expect(eq(ctx, marshalPrimitive(ctx, 1) ?? ctx.undefined, ctx.newNumber(1))).toBe(true)
	expect(eq(ctx, marshalPrimitive(ctx, -100) ?? ctx.undefined, ctx.newNumber(-100))).toBe(true)
	expect(eq(ctx, marshalPrimitive(ctx, 'hoge') ?? ctx.undefined, ctx.newString('hoge'))).toBe(true)
	expect(eq(ctx, marshalPrimitive(ctx, BigInt(1)) ?? ctx.undefined, ctx.newBigInt(BigInt(1)))).toBe(true)
	const arrayBuffer = new ArrayBuffer(10)
	const uint8Array = new Uint8Array(arrayBuffer)
	uint8Array[0] = 100 // Set the first byte to 100 (decimal)
	uint8Array[1] = 255 // Set the second byte to 255 (decimal)
	uint8Array[2] = 67 // Set the third byte to 67 (decimal)
	expect(arrayBufferEq(ctx, marshalPrimitive(ctx, arrayBuffer) ?? ctx.undefined, ctx.newArrayBuffer(arrayBuffer))).toBe(
		true,
	)

	expect(marshalPrimitive(ctx, () => {})).toBe(undefined)
	expect(marshalPrimitive(ctx, [])).toBe(undefined)
	expect(marshalPrimitive(ctx, {})).toBe(undefined)

	ctx.dispose()
})
