import { type JSPromiseState, type QuickJSHandle, Scope } from 'quickjs-emscripten-core'
import type { VMContext } from '../../types/VMContext.js'
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
export const handleToNative = (ctx: VMContext, handle: QuickJSHandle, rootScope: Scope) => {
	const ty = ctx.typeof(handle)

	if (ty === 'undefined') {
		return undefined
	}
	if (ty === 'null') {
		return null
	}
	if (ty === 'number' || ty === 'string' || ty === 'boolean' || ty === 'bigint') {
		const val = ctx.dump(handle)
		return val
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
				if (typeof keyName !== 'string' && typeof keyName !== 'number' && typeof keyName !== 'symbol') {
					return
				}

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
						desc[key] = ctx.dump(ctx.getProp(value, key))
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
					'internal/serializer/setProperties,js',
					`(o, fn) => {
              const descs = Object.getOwnPropertyDescriptors(o);
              Object.entries(descs).forEach(([k, v]) => fn(k, v) );
              Object.getOwnPropertySymbols(descs).forEach(k => fn(k, descs[k]));
          }`,
					undefined,
					h,
					f,
				).dispose()
			})
	}

	if (ty === 'function') {
		const func = () => {
			// make a copy
			const cpHandle = rootScope.manage(handle.dup())

			return function (this: any, ...args: any[]) {
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

				const resultHandle = scope.manage(ctx.unwrapResult(ctx.callFunction(cpHandle, thisHandle, ...argHandles)))

				const res = handleToNative(ctx, resultHandle, rootScope)
				scope.dispose()

				return res
			}
		}

		const f = func()
		setProperties(f, handle)
		return f
	}

	if (ty === 'object') {
		const obj = call(ctx, 'internal/serializer/isArray.js', 'Array.isArray', undefined, handle).consume(r =>
			ctx.dump(r),
		)
			? []
			: {}

		const constructorName = call(
			ctx,
			'internal/serializer/getConstructorName.js',
			`(o) => {
        if(!o.constructor) { return };
        return o.constructor.name
      }`,
			undefined,
			handle,
		).consume(r => ctx.dump(r))

		const serializer = getSerializer(constructorName)
		if (serializer) {
			const ret = serializer(ctx, handle)
			if (ret) {
				return ret
			}
		}

		setProperties(obj, handle)

		return obj
	}

	throw new TypeError(`Failed to serialize ${ty}`)
}
