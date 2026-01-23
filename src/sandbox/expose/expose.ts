import { type QuickJSAsyncContext, type QuickJSContext, type QuickJSHandle, Scope } from 'quickjs-emscripten-core'
import { HEADERS_MARKER } from '../../adapter/fetch.js'
import { handleToNative } from '../handleToNative/handleToNative.js'
import { isES2015Class } from './isES2015Class.js'
import { isObject } from './isObject.js'

export const getHandle = (
	scope: Scope,
	ctx: QuickJSContext | QuickJSAsyncContext,
	name: string,
	input: unknown,
): QuickJSHandle => {
	// null
	if (input === null) {
		return ctx.null
	}

	// null
	if (input === undefined) {
		return ctx.undefined
	}

	// Headers-like object - construct using sandbox's Headers class
	if (input && typeof input === 'object' && HEADERS_MARKER in input && (input as any)._headers) {
		const headersData = (input as any)._headers as Record<string, string>
		const headersJson = JSON.stringify(headersData)
		const result = ctx.evalCode(`new Headers(${headersJson})`)
		return result.unwrap()
	}

	// Array Buffer
	if (input instanceof ArrayBuffer) {
		return ctx.newArrayBuffer(input)
	}
	// Promise
	if (input instanceof Promise) {
		const promise = ctx.newPromise()
		promise.settled.then(ctx.runtime.executePendingJobs)
		input.then(
			r => {
				const handle = getHandle(scope, ctx, '', r)
				promise.resolve(handle)
				handle.dispose()
			},
			e => {
				const handle = getHandle(scope, ctx, '', e)
				promise.reject(handle)
				handle.dispose()
			},
		)

		return promise.handle
	}

	switch (typeof input) {
		case 'number':
			return ctx.newNumber(input)
		case 'string':
			return ctx.newString(input)
		case 'boolean':
			return input ? ctx.true : ctx.false
		case 'bigint':
			return ctx.newBigInt(input)
		case 'symbol':
			return ctx.newSymbolFor(input)
		case 'function':
			return ctx.newFunction(name, function (...args) {
				const s = new Scope()

				const that = handleToNative(ctx, this, s)
				if (this) {
					this.dispose()
				}

				if (isES2015Class(input) && isObject(that)) {
					const result = new input(...args)
					for (const [key, value] of Object.entries(result)) {
						ctx.setProp(this, key, getHandle(s, ctx, key, value))
					}
					s.dispose()

					return this as any
				}

				const rawParam: any[] = []
				for (const param of args) {
					const p = s.manage(param)
					rawParam.push(handleToNative(ctx, p, s))
				}

				try {
					const handle = getHandle(s, ctx, '', input.apply(that, rawParam))
					return handle
				} finally {
					s.dispose()
				}
			})
	}
	if (typeof input === 'object' || input === null) {
		if (input instanceof Date) {
			const x = ctx.evalCode(`new Date(${input.getTime()})`)
			return x.unwrap()
		}

		const prototype = Object.getPrototypeOf(input)

		const prototypeHandle =
			prototype && prototype !== Object.prototype && prototype !== Array.prototype
				? getHandle(scope, ctx, '', prototype)
				: undefined

		const handle = Array.isArray(input) ? ctx.newArray() : ctx.newObject(prototypeHandle)

		setProperties(ctx, scope, input, handle)

		prototypeHandle?.dispose()
		return handle
	}

	throw new Error(`unsupported data type in ${name} ${typeof input}`)
}

const setProperties = (
	ctx: QuickJSContext | QuickJSAsyncContext,
	scope: Scope,
	// biome-ignore lint/complexity/noBannedTypes: ok here
	input: object | Function,
	parent: QuickJSHandle,
) => {
	const descs = ctx.newObject()

	const setEntry = (key: string | number | symbol, desc: PropertyDescriptor) => {
		const keyHandle = getHandle(scope, ctx, '', key)
		const valueHandle = typeof desc.value === 'undefined' ? undefined : getHandle(scope, ctx, '', desc.value)
		const getterHandle = typeof desc.get === 'undefined' ? undefined : getHandle(scope, ctx, '', desc.get)
		const setterHandle = typeof desc.set === 'undefined' ? undefined : getHandle(scope, ctx, '', desc.set)

		const descObj = ctx.newObject()
		for (const [k, v] of Object.entries(desc)) {
			const v2 =
				k === 'value' ? valueHandle : k === 'get' ? getterHandle : k === 'set' ? setterHandle : v ? ctx.true : ctx.false
			if (v2) {
				ctx.setProp(descObj, k, v2)
			}
		}

		ctx.setProp(descs, keyHandle, descObj)

		keyHandle.dispose()
		valueHandle?.dispose()
		getterHandle?.dispose()
		setterHandle?.dispose()
		descObj.dispose()
	}

	const desc = Object.getOwnPropertyDescriptors(input)
	for (const [k, v] of Object.entries(desc)) {
		setEntry(k, v)
	}
	for (const k of Object.getOwnPropertySymbols(desc)) {
		setEntry(k, (desc as any)[k])
	}

	const fnHandle = ctx.unwrapResult(ctx.evalCode('Object.defineProperties'))
	const callHandle = ctx.unwrapResult(ctx.callFunction(fnHandle, ctx.undefined, parent, descs))
	callHandle.dispose()
	fnHandle.dispose()
	descs.dispose()
}

const addProp = (
	scope: Scope,
	ctx: QuickJSContext | QuickJSAsyncContext,
	parent: QuickJSHandle,
	name: string,
	value,
) => {
	const handle = scope.manage(getHandle(scope, ctx, name, value))
	ctx.setProp(parent, name, handle)
}

export const expose = (
	ctx: QuickJSContext | QuickJSAsyncContext,
	_parentScope: Scope,
	input: Record<string, unknown>,
	parent?: QuickJSHandle,
) => {
	const scope = new Scope()
	for (const [key, value] of Object.entries(input)) {
		addProp(scope, ctx, parent ?? ctx.global, key, value)
	}
	scope.dispose()
}
