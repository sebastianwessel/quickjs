import {
	type JSPromiseState,
	type QuickJSAsyncContext,
	type QuickJSContext,
	type QuickJSHandle,
	Scope,
} from 'quickjs-emscripten-core'
import { getHandle } from '../expose/expose.js'
import { call } from '../helper.js'
import { getSerializer } from './serializer/index.js'

/**
 * Serialize data from guest to host
 *
 * @param ctx The sandbox context
 * @param handle The QuickJS handle to serialize
 * @returns
 */
export const handleToNative = (ctx: QuickJSContext | QuickJSAsyncContext, handle: QuickJSHandle, rootScope?: Scope) => {
	const ty = ctx.typeof(handle)

	if (ty === 'undefined') {
		return undefined
	}
	if (ty === 'null') {
		return null
	}
	if (ty === 'number' || ty === 'string' || ty === 'boolean' || ty === 'bigint') {
		return ctx.dump(handle)
	}

	if (ty === 'symbol') {
		const desc = ctx.getString(ctx.getProp(handle, 'description'))
		return Symbol(desc)
	}

	const asPromiseState: JSPromiseState & { notAPromise?: boolean } = ctx.getPromiseState(handle)

	if (asPromiseState.type && !asPromiseState.notAPromise) {
		return ctx.resolvePromise(handle).then(val => {
			if (val.error) {
				const error = handleToNative(ctx, val.error, rootScope)
				val.error.dispose()
				return Promise.reject(error)
			}
			const value = handleToNative(ctx, val.value, rootScope)
			val.value.dispose()
			return Promise.resolve(value)
		})
	}

	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	const setProperties = (obj: Object | Function, h: QuickJSHandle) => {
		ctx
			.newFunction('', (key, value) => {
				const keyName = handleToNative(ctx, key, rootScope)
				if (typeof keyName !== 'string' && typeof keyName !== 'number' && typeof keyName !== 'symbol') return

				const desc = (
					[
						['value', true],
						['get', true],
						['set', true],
						['configurable', false],
						['enumerable', false],
						['writable', false],
					] as const
				).reduce<PropertyDescriptor>((desc, [key, unmarshable]) => {
					const h = ctx.getProp(value, key)
					const t = ctx.typeof(h)

					if (t === 'undefined') return desc
					if (!unmarshable && t === 'boolean') {
						desc[key] = ctx.dump(h)
						return desc
					}

					desc[key] = handleToNative(ctx, h, rootScope)

					h.dispose()

					return desc
				}, {})

				Object.defineProperty(obj, keyName, desc)
			})
			.consume(f => {
				call(
					ctx,
					'internal/serializer/setProperties.js',
					`(o, fn) => {
						const descs = Object.getOwnPropertyDescriptors(o);
						Object.entries(descs).forEach(([k, v]) => fn(k, v));
						Object.getOwnPropertySymbols(descs).forEach(k => fn(k, descs[k]));
					}`,
					undefined,
					h,
					f,
				).dispose()
			})
	}

	if (ty === 'function') {
		if (!rootScope) throw new Error('Missing root scope')
		const cpHandle = rootScope.manage(handle.dup())

		const f = function (this: any, ...args: any[]) {
			const scope = new Scope()
			const thisHandle = getHandle(scope, ctx, '', this)
			const argHandles = args.map(a => getHandle(scope, ctx, '', a))

			if (new.target) {
				const instance = handleToNative(
					ctx,
					call(
						ctx,
						'internal/serializer/newClass.js',
						'(Cls, ...args) => new Cls(...args)',
						thisHandle,
						cpHandle,
						...argHandles,
					),
					rootScope,
				)
				Object.defineProperties(this, Object.getOwnPropertyDescriptors(instance))
				scope.dispose()
				return this
			}

			try {
				const resultHandle = scope.manage(ctx.unwrapResult(ctx.callFunction(cpHandle, thisHandle, ...argHandles)))
				const res = handleToNative(ctx, resultHandle, rootScope)
				return res
			} finally {
				scope.dispose()
			}
		}

		setProperties(f, handle)
		return f
	}

	if (ty === 'object') {
		const isNull = call(ctx, 'internal/serializer/isNull.js', 'a => a === null', undefined, handle).consume(r =>
			ctx.dump(r),
		)
		if (isNull) return null

		// Check for Error instances
		const errorType = call(
			ctx,
			'internal/serializer/detectErrorType.js',
			`(o) => {
				try {
					const tag = Object.prototype.toString.call(o)
					if (tag.startsWith('[object ') && tag.endsWith(']')) {
						const type = tag.slice(8, -1)
						if (type.endsWith('Error')) return type
					}
				} catch {}
				if (typeof o?.name === 'string' && typeof o?.message === 'string') return 'Error'
				return undefined
			}`,
			undefined,
			handle,
		).consume(r => ctx.dump(r))

		if (typeof errorType === 'string') {
			const s = getSerializer(errorType)
			if (s) {
				const ret = s(ctx, handle)
				if (ret) {
					return ret
				}
			}

			const messageHandle = ctx.getProp(handle, 'message')
			const stackHandle = ctx.getProp(handle, 'stack')

			const message = ctx.dump(messageHandle) ?? ''
			const stack = ctx.dump(stackHandle)

			messageHandle.dispose()
			stackHandle.dispose()

			const e = new Error(message)
			e.name = errorType
			if (typeof stack === 'string') e.stack = stack

			return e
		}

		const isArray = call(ctx, 'internal/serializer/isArray.js', 'Array.isArray', undefined, handle).consume(r =>
			ctx.dump(r),
		)

		const obj: any = isArray ? [] : {}

		const constructorName = call(
			ctx,
			'internal/serializer/getConstructorName.js',
			`o => typeof o?.constructor?.name === 'string' ? o.constructor.name : undefined`,
			undefined,
			handle,
		).consume(r => ctx.dump(r))

                const serializer = getSerializer(constructorName)
                if (serializer) {
                        const ret = serializer(ctx, handle, rootScope)
			if (ret) {
				return ret
			}
		}

		setProperties(obj, handle)

		return obj
	}

	throw new TypeError(`Failed to serialize ${ty}`)
}
