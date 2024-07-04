import { describe, expect, it } from 'bun:test'
import { quickJS } from '../quickJS.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('node:util - types', () => {
	const typesToTest = [
		{ method: 'isAnyArrayBuffer', value: 'new ArrayBuffer(10)', expected: true },
		{ method: 'isAnyArrayBuffer', value: 'new SharedArrayBuffer(10)', expected: true },
		{ method: 'isArrayBufferView', value: 'new Uint8Array(10)', expected: true },
		{ method: 'isArgumentsObject', value: '(function() { return arguments; })()', expected: true },
		{ method: 'isArrayBuffer', value: 'new ArrayBuffer(10)', expected: true },
		{ method: 'isAsyncFunction', value: 'async function() {}', expected: true },
		{ method: 'isBigInt64Array', value: 'new BigInt64Array(10)', expected: true },
		{ method: 'isBigUint64Array', value: 'new BigUint64Array(10)', expected: true },
		{ method: 'isBooleanObject', value: 'new Boolean(true)', expected: true },
		{ method: 'isBoxedPrimitive', value: 'new String("test")', expected: true },
		{ method: 'isDataView', value: 'new DataView(new ArrayBuffer(10))', expected: true },
		{ method: 'isDate', value: 'new Date()', expected: true },
		{ method: 'isFloat32Array', value: 'new Float32Array(10)', expected: true },
		{ method: 'isFloat64Array', value: 'new Float64Array(10)', expected: true },
		{ method: 'isGeneratorFunction', value: 'function*() {}', expected: true },
		{ method: 'isGeneratorObject', value: '(function*() {})()', expected: true },
		{ method: 'isInt8Array', value: 'new Int8Array(10)', expected: true },
		{ method: 'isInt16Array', value: 'new Int16Array(10)', expected: true },
		{ method: 'isInt32Array', value: 'new Int32Array(10)', expected: true },
		{ method: 'isMap', value: 'new Map()', expected: true },
		{ method: 'isMapIterator', value: 'new Map().entries()', expected: true },
		{ method: 'isNativeError', value: 'new Error()', expected: true },
		{ method: 'isNumberObject', value: 'new Number(10)', expected: true },
		{ method: 'isPromise', value: 'new Promise(() => {})', expected: true },
		{ method: 'isRegExp', value: '/test/', expected: true },
		{ method: 'isSet', value: 'new Set()', expected: true },
		{ method: 'isSetIterator', value: 'new Set().entries()', expected: true },
		{ method: 'isSharedArrayBuffer', value: 'new SharedArrayBuffer(10)', expected: true },
		{ method: 'isStringObject', value: 'new String("test")', expected: true },
		{ method: 'isSymbolObject', value: 'Object(Symbol("test"))', expected: true },
		{ method: 'isTypedArray', value: 'new Uint8Array(10)', expected: true },
		{ method: 'isUint8Array', value: 'new Uint8Array(10)', expected: true },
		{ method: 'isUint8ClampedArray', value: 'new Uint8ClampedArray(10)', expected: true },
		{ method: 'isUint16Array', value: 'new Uint16Array(10)', expected: true },
		{ method: 'isUint32Array', value: 'new Uint32Array(10)', expected: true },
		{ method: 'isWeakMap', value: 'new WeakMap()', expected: true },
		{ method: 'isWeakSet', value: 'new WeakSet()', expected: true },
	]

	for (const { method, value, expected } of typesToTest) {
		it(`${method} works correctly`, async () => {
			const { initRuntime } = await quickJS()
			const { evalCode } = await initRuntime()

			const code = `
        import { types } from 'node:util'
        const result = types.${method}(${value})
        export default result
      `

			const result = (await evalCode(code)) as OkResponse
			expect(result.ok).toBeTrue()
			expect(result.data).toBe(expected)
		})
	}
})
