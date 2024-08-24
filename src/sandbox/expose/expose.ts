import { type QuickJSHandle, Scope } from 'quickjs-emscripten-core'
import type { VMContext } from '../../types/VMContext.js'
import { handleToNative } from '../handleToNative/handleToNative.js'
import { isES2015Class } from './isES2015Class.js'
import { isObject } from './isObject.js'

export const getHandle = (scope: Scope, ctx: VMContext, name: string, input: unknown): QuickJSHandle => {
	// null
	if (input === null) {
		return ctx.null
	}

	// null
	if (input === undefined) {
		return ctx.undefined
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
				handle.dispose
			},
		)

		return promise.handle
	}

	switch (typeof input) {
		case 'undefined':
			return ctx.undefined
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
				const that = handleToNative(ctx, this)
				if (this) {
					this.dispose()
				}

				const s = new Scope()

				if (isES2015Class(input) && isObject(that)) {
					const result = new input(...args)
					for (const [key, value] of Object.entries(result)) {
						ctx.setProp(this, key, getHandle(s, ctx, key, value))
					}
					s.dispose()

					return this
				}

				const rawParam: any[] = []
				for (const param of args) {
					rawParam.push(handleToNative(ctx, param))
					param.dispose
				}

				const handle = getHandle(s, ctx, '', input.apply(that, rawParam))

				s.dispose()

				return handle
			})
	}
	if (typeof input === 'object' || input === null) {
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

const setProperties = (ctx: VMContext, scope: Scope, input: object | Function, parent: QuickJSHandle) => {
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

const addProp = (scope: Scope, ctx: VMContext, parent: QuickJSHandle, name: string, value) => {
	const handle = scope.manage(getHandle(scope, ctx, name, value))
	ctx.setProp(parent, name, handle)
}

export const expose = (ctx: VMContext, _parentScope: Scope, input: Record<string, unknown>, parent?: QuickJSHandle) => {
	const scope = new Scope()
	for (const [key, value] of Object.entries(input)) {
		addProp(scope, ctx, parent ?? ctx.global, key, value)
	}
	scope.dispose()
}
