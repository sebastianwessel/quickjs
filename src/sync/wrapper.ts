import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { isObject } from './util.js'
import { call, isHandleObject, mayConsumeAll } from './vmutil.js'

export type SyncMode = 'both' | 'vm' | 'host'

export type Wrapped<T> = T & { __qes_wrapped: never }

export function wrap<T = any>(
	ctx: QuickJSContext,
	target: T,
	proxyKeySymbol: symbol,
	proxyKeySymbolHandle: QuickJSHandle,
	marshal: (target: any) => [QuickJSHandle, boolean],
	syncMode?: (target: T) => SyncMode | undefined,
	wrappable?: (target: unknown) => boolean,
): Wrapped<T> | undefined {
	// promise and date cannot be wrapped
	if (!isObject(target) || target instanceof Promise || target instanceof Date || (wrappable && !wrappable(target)))
		return undefined

	if (isWrapped(target, proxyKeySymbol)) return target

	const rec = new Proxy(target as any, {
		get(obj, key) {
			return key === proxyKeySymbol ? obj : Reflect.get(obj, key)
		},
		set(obj, key, value, receiver) {
			const v = unwrap(value, proxyKeySymbol)
			const sync = syncMode?.(receiver) ?? 'host'
			if ((sync !== 'vm' && !Reflect.set(obj, key, v, receiver)) || sync === 'host' || !ctx.alive) return true

			mayConsumeAll([marshal(receiver), marshal(key), marshal(v)], (receiverHandle, keyHandle, valueHandle) => {
				const [handle2, unwrapped] = unwrapHandle(ctx, receiverHandle, proxyKeySymbolHandle)
				if (unwrapped) {
					handle2.consume(h => ctx.setProp(h, keyHandle, valueHandle))
				} else {
					ctx.setProp(handle2, keyHandle, valueHandle)
				}
			})

			return true
		},
		deleteProperty(obj, key) {
			const sync = syncMode?.(rec) ?? 'host'
			return mayConsumeAll([marshal(rec), marshal(key)], (recHandle, keyHandle) => {
				const [handle2, unwrapped] = unwrapHandle(ctx, recHandle, proxyKeySymbolHandle)

				if (sync === 'vm' || Reflect.deleteProperty(obj, key)) {
					if (sync === 'host' || !ctx.alive) return true

					if (unwrapped) {
						handle2.consume(h => call(ctx, '(a, b) => delete a[b]', undefined, h, keyHandle))
					} else {
						call(ctx, '(a, b) => delete a[b]', undefined, handle2, keyHandle)
					}
				}
				return true
			})
		},
	}) as Wrapped<T>
	return rec
}

export function wrapHandle(
	ctx: QuickJSContext,
	handle: QuickJSHandle,
	proxyKeySymbol: symbol,
	proxyKeySymbolHandle: QuickJSHandle,
	unmarshal: (handle: QuickJSHandle) => any,
	syncMode?: (target: QuickJSHandle) => SyncMode | undefined,
	wrappable?: (target: QuickJSHandle, ctx: QuickJSContext) => boolean,
): [Wrapped<QuickJSHandle> | undefined, boolean] {
	if (!isHandleObject(ctx, handle) || (wrappable && !wrappable(handle, ctx))) return [undefined, false]

	if (isHandleWrapped(ctx, handle, proxyKeySymbolHandle)) return [handle, false]

	const getSyncMode = (h: QuickJSHandle) => {
		const res = syncMode?.(unmarshal(h))
		if (typeof res === 'string') return ctx.newString(res)
		return ctx.undefined
	}

	const setter = (h: QuickJSHandle, keyHandle: QuickJSHandle, valueHandle: QuickJSHandle) => {
		const target = unmarshal(h)
		if (!target) return
		const key = unmarshal(keyHandle)
		if (key === '__proto__') return // for security
		const value = unmarshal(valueHandle)
		unwrap(target, proxyKeySymbol)[key] = value
	}

	const deleter = (h: QuickJSHandle, keyHandle: QuickJSHandle) => {
		const target = unmarshal(h)
		if (!target) return
		const key = unmarshal(keyHandle)
		delete unwrap(target, proxyKeySymbol)[key]
	}

	return ctx
		.newFunction('proxyFuncs', (t, ...args) => {
			const name = ctx.getNumber(t)
			switch (name) {
				case 1:
					return getSyncMode(args[0])
				case 2:
					return setter(args[0], args[1], args[2])
				case 3:
					return deleter(args[0], args[1])
			}
			return ctx.undefined
		})
		.consume(proxyFuncs => [
			call(
				ctx,
				`(target, sym, proxyFuncs) => {
          const rec =  new Proxy(target, {
            get(obj, key, receiver) {
              return key === sym ? obj : Reflect.get(obj, key, receiver)
            },
            set(obj, key, value, receiver) {
              const v = typeof value === "object" && value !== null || typeof value === "function"
                ? value[sym] ?? value
                : value;
              const sync = proxyFuncs(1, receiver) ?? "vm";
              if (sync === "host" || Reflect.set(obj, key, v, receiver)) {
                if (sync !== "vm") {
                  proxyFuncs(2, receiver, key, v);
                }
              }
              return true;
            },
            deleteProperty(obj, key) {
              const sync = proxyFuncs(1, rec) ?? "vm";
              if (sync === "host" || Reflect.deleteProperty(obj, key)) {
                if (sync !== "vm") {
                  proxyFuncs(3, rec, key);
                }
              }
              return true;
            },
          });
          return rec;
        }`,
				undefined,
				handle,
				proxyKeySymbolHandle,
				proxyFuncs,
			) as Wrapped<QuickJSHandle>,
			true,
		])
}

export function unwrap<T>(obj: T, key: string | symbol): T {
	return isObject(obj) ? ((obj as any)[key] as T) ?? obj : obj
}

export function unwrapHandle(ctx: QuickJSContext, handle: QuickJSHandle, key: QuickJSHandle): [QuickJSHandle, boolean] {
	if (!isHandleWrapped(ctx, handle, key)) return [handle, false]
	return [ctx.getProp(handle, key), true]
}

export function isWrapped<T>(obj: T, key: string | symbol): obj is Wrapped<T> {
	return isObject(obj) && !!(obj as any)[key]
}

export function isHandleWrapped(
	ctx: QuickJSContext,
	handle: QuickJSHandle,
	key: QuickJSHandle,
): handle is Wrapped<QuickJSHandle> {
	return !!ctx.dump(
		call(
			ctx,
			// promise and date cannot be wrapped
			`(a, s) => (a instanceof Promise) || (a instanceof Date) || (typeof a === "object" && a !== null || typeof a === "function") && !!a[s]`,
			undefined,
			handle,
			key,
		),
	)
}
