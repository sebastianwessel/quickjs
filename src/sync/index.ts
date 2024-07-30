import type {
	ContextEvalOptions,
	QuickJSAsyncContext,
	QuickJSContext,
	QuickJSDeferredPromise,
	QuickJSHandle,
	SuccessOrFail,
	VmCallResult,
} from 'quickjs-emscripten-core'

import { type QuickJSContextEx, wrapContext } from './contextex.js'
import { defaultRegisteredObjects } from './default.js'
import marshal from './marshal/index.js'
import unmarshal from './unmarshal/index.js'
import { complexity, isES2015Class, isObject, walkObject } from './util.js'
import VMMap from './vmmap.js'
import { call, consumeAll, eq, handleFrom, isHandleObject, json, mayConsume } from './vmutil.js'
import { type Wrapped, unwrap, unwrapHandle, wrap, wrapHandle } from './wrapper.js'

export {
	VMMap,
	defaultRegisteredObjects,
	marshal,
	unmarshal,
	complexity,
	isES2015Class,
	isObject,
	walkObject,
	call,
	eq,
	isHandleObject,
	json,
	consumeAll,
}

export type Options = {
	/** A callback that returns a boolean value that determines whether an object is marshalled or not. If false, no marshaling will be done and undefined will be passed to the QuickJS VM, otherwise marshaling will be done. By default, all objects will be marshalled. */
	isMarshalable?: boolean | 'json' | ((target: any) => boolean | 'json')
	/** Pre-registered pairs of objects that will be considered the same between the host and the QuickJS VM. This will be used automatically during the conversion. By default, it will be registered automatically with `defaultRegisteredObjects`.
	 *
	 * Instead of a string, you can also pass a QuickJSHandle directly. In that case, however, you have to dispose of them manually when destroying the VM.
	 */
	registeredObjects?: Iterable<[any, QuickJSHandle | string]>
	/** Register functions to convert an object to a QuickJS handle. */
	customMarshaller?: Iterable<(target: unknown, ctx: QuickJSContext) => QuickJSHandle | undefined>
	/** Register functions to convert a QuickJS handle to an object. */
	customUnmarshaller?: Iterable<(target: QuickJSHandle, ctx: QuickJSContext) => any>
	/** A callback that returns a boolean value that determines whether an object is wrappable by proxies. If returns false, note that the object cannot be synchronized between the host and the QuickJS even if arena.sync is used. */
	isWrappable?: (target: any) => boolean
	/** A callback that returns a boolean value that determines whether an QuickJS handle is wrappable by proxies. If returns false, note that the handle cannot be synchronized between the host and the QuickJS even if arena.sync is used. */
	isHandleWrappable?: (handle: QuickJSHandle, ctx: QuickJSContext) => boolean
	/** Compatibility with quickjs-emscripten prior to v0.15. Inject code for compatibility into context at Arena class initialization time. */
	compat?: boolean
	/** Experimental: use QuickJSContextEx, which wraps existing QuickJSContext. */
	experimentalContextEx?: boolean
}

/**
 * The Arena class manages all generated handles at once by quickjs-emscripten and automatically converts objects between the host and the QuickJS VM.
 */
export class Arena {
	context: QuickJSContextEx
	_map: VMMap
	_registeredMap: VMMap
	_registeredMapDispose: Set<any> = new Set()
	_sync: Set<any> = new Set()
	_temporalSync: Set<any> = new Set()
	_symbol = Symbol()
	_symbolHandle: QuickJSHandle
	_options?: Options

	/** Constructs a new Arena instance. It requires a quickjs-emscripten context initialized with `quickjs.newContext()`. */
	constructor(ctx: QuickJSContext, options?: Options) {
		if (options?.compat && !('runtime' in ctx)) {
			;(ctx as any).runtime = {
				hasPendingJob: () => (ctx as any).hasPendingJob(),
				executePendingJobs: (maxJobsToExecute?: number | undefined) =>
					(ctx as any).executePendingJobs(maxJobsToExecute),
			}
		}

		this.context = options?.experimentalContextEx ? wrapContext(ctx) : ctx
		this._options = options
		this._symbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
		this._map = new VMMap(ctx)
		this._registeredMap = new VMMap(ctx)
		this.registerAll(options?.registeredObjects ?? defaultRegisteredObjects)
		ctx.evalCode('var global = globalThis')
	}

	/**
	 * Dispose of the arena and managed handles. This method won't dispose the VM itself, so the VM has to be disposed of manually.
	 */
	dispose() {
		this._map.dispose()
		this._registeredMap.dispose()
		this._symbolHandle.dispose()
		this.context.disposeEx?.()
	}

	/**
	 * Evaluate JS code in the VM and get the result as an object on the host side. It also converts and re-throws error objects when an error is thrown during evaluation.
	 */
	evalCode<T = any>(code: string, filename?: string, options?: number | ContextEvalOptions): T {
		const handle = this.context.evalCode(code, filename, options)
		return this._unwrapResultAndUnmarshal(handle)
	}

	/**
	 * Almost same as `vm.executePendingJobs()`, but it converts and re-throws error objects when an error is thrown during evaluation.
	 */
	executePendingJobs(maxJobsToExecute?: number): number {
		const result = this.context.runtime.executePendingJobs(maxJobsToExecute)
		if ('value' in result) {
			return result.value
		}
		throw this._unwrapIfNotSynced(result.error.consume(this._unmarshal))
	}

	/**
	 * Expose objects as global objects in the VM.
	 *
	 * By default, exposed objects are not synchronized between the host and the VM.
	 * If you want to sync an objects, first wrap the object with sync method, and then expose the wrapped object.
	 */
	expose(obj: { [k: string]: any }) {
		for (const [key, value] of Object.entries(obj)) {
			mayConsume(this._marshal(value), handle => {
				this.context.setProp(this.context.global, key, handle)
			})
		}
	}

	/**
	 * Enables sync for the object between the host and the VM and returns objects wrapped with proxies.
	 *
	 * The return value is necessary in order to reflect changes to the object from the host to the VM. Please note that setting a value in the field or deleting a field in the original object will not synchronize it.
	 */
	sync<T>(target: T): T {
		const wrapped = this._wrap(target)
		if (typeof wrapped === 'undefined') return target
		walkObject(wrapped, v => {
			const u = this._unwrap(v)
			this._sync.add(u)
			return undefined
		})
		return wrapped
	}

	/**
	 * Register a pair of objects that will be considered the same between the host and the QuickJS VM.
	 *
	 * Instead of a string, you can also pass a QuickJSHandle directly. In that case, however, when  you have to dispose them manually when destroying the VM.
	 */
	register(target: any, handleOrCode: QuickJSHandle | string) {
		if (this._registeredMap.has(target)) return
		const handle =
			typeof handleOrCode === 'string' ? this._unwrapResult(this.context.evalCode(handleOrCode)) : handleOrCode
		if (eq(this.context, handle, this.context.undefined)) return
		if (typeof handleOrCode === 'string') {
			this._registeredMapDispose.add(target)
		}
		this._registeredMap.set(target, handle)
	}

	/**
	 * Execute `register` methods for each pair.
	 */
	registerAll(map: Iterable<[any, QuickJSHandle | string]>) {
		for (const [k, v] of map) {
			this.register(k, v)
		}
	}

	/**
	 * Unregister a pair of objects that were registered with `registeredObjects` option and `register` method.
	 */
	unregister(target: any, dispose?: boolean) {
		this._registeredMap.delete(target, this._registeredMapDispose.has(target) || dispose)
		this._registeredMapDispose.delete(target)
	}

	/**
	 * Execute `unregister` methods for each target.
	 */
	unregisterAll(targets: Iterable<any>, dispose?: boolean) {
		for (const t of targets) {
			this.unregister(t, dispose)
		}
	}

	startSync(target: any) {
		if (!isObject(target)) return
		const u = this._unwrap(target)
		this._sync.add(u)
	}

	endSync(target: any) {
		this._sync.delete(this._unwrap(target))
	}

	_unwrapResult<T>(result: SuccessOrFail<T, QuickJSHandle>): T {
		if ('value' in result) {
			return result.value
		}
		throw this._unwrapIfNotSynced(result.error.consume(this._unmarshal))
	}

	_unwrapResultAndUnmarshal(result: VmCallResult<QuickJSHandle> | undefined): any {
		if (!result) return
		return this._unwrapIfNotSynced(this._unwrapResult(result).consume(this._unmarshal))
	}

	_isMarshalable = (t: unknown): boolean | 'json' => {
		const im = this._options?.isMarshalable
		return (typeof im === 'function' ? im(this._unwrap(t)) : im) ?? 'json'
	}

	_marshalFind = (t: unknown) => {
		const unwrappedT = this._unwrap(t)
		const handle =
			this._registeredMap.get(t) ??
			(unwrappedT !== t ? this._registeredMap.get(unwrappedT) : undefined) ??
			this._map.get(t) ??
			(unwrappedT !== t ? this._map.get(unwrappedT) : undefined)
		return handle
	}

	_marshalPre = (
		t: unknown,
		h: QuickJSHandle | QuickJSDeferredPromise,
		mode: true | 'json' | undefined,
	): Wrapped<QuickJSHandle> | undefined => {
		if (mode === 'json') return
		return this._register(t, handleFrom(h), this._map)?.[1]
	}

	_marshalPreApply = (target: Function, that: unknown, args: unknown[]): QuickJSHandle | undefined => {
		const unwrapped = isObject(that) ? this._unwrap(that) : undefined
		// override sync mode of this object while calling the function
		if (unwrapped) this._temporalSync.add(unwrapped)
		try {
			return target.apply(that, args)
		} finally {
			// restore sync mode
			if (unwrapped) this._temporalSync.delete(unwrapped)
		}
	}

	_marshal = (target: any): [QuickJSHandle, boolean] => {
		const registered = this._registeredMap.get(target)
		if (registered) {
			return [registered, false]
		}

		const handle = marshal(this._wrap(target) ?? target, {
			ctx: this.context,
			unmarshal: this._unmarshal,
			isMarshalable: this._isMarshalable,
			find: this._marshalFind,
			pre: this._marshalPre,
			preApply: this._marshalPreApply,
			custom: this._options?.customMarshaller,
		})

		return [handle, !this._map.hasHandle(handle)]
	}

	_preUnmarshal = (t: any, h: QuickJSHandle): Wrapped<any> => {
		return this._register(t, h, undefined, true)?.[0]
	}

	_unmarshalFind = (h: QuickJSHandle): unknown => {
		return this._registeredMap.getByHandle(h) ?? this._map.getByHandle(h)
	}

	_unmarshal = (handle: QuickJSHandle): any => {
		const registered = this._registeredMap.getByHandle(handle)
		if (typeof registered !== 'undefined') {
			return registered
		}

		const [wrappedHandle] = this._wrapHandle(handle)
		return unmarshal(wrappedHandle ?? handle, {
			ctx: this.context,
			marshal: this._marshal,
			find: this._unmarshalFind,
			pre: this._preUnmarshal,
			custom: this._options?.customUnmarshaller,
		})
	}

	_register(
		t: any,
		h: QuickJSHandle,
		map: VMMap = this._map,
		sync?: boolean,
	): [Wrapped<any>, Wrapped<QuickJSHandle>] | undefined {
		if (this._registeredMap.has(t) || this._registeredMap.hasHandle(h)) {
			return
		}

		let wrappedT = this._wrap(t)
		const [wrappedH] = this._wrapHandle(h)
		const isPromise = t instanceof Promise
		if (!wrappedH || (!wrappedT && !isPromise)) return // t or h is not an object
		if (isPromise) wrappedT = t

		const unwrappedT = this._unwrap(t)
		const [unwrappedH, unwrapped] = this._unwrapHandle(h)

		const res = map.set(wrappedT, wrappedH, unwrappedT, unwrappedH)
		if (!res) {
			// already registered
			if (unwrapped) unwrappedH.dispose()
			throw new Error('already registered')
		}
		if (sync) {
			this._sync.add(unwrappedT)
		}

		return [wrappedT, wrappedH]
	}

	_syncMode = (obj: any): 'both' | undefined => {
		const obj2 = this._unwrap(obj)
		return this._sync.has(obj2) || this._temporalSync.has(obj2) ? 'both' : undefined
	}

	_wrap<T>(target: T): Wrapped<T> | undefined {
		return wrap(
			this.context,
			target,
			this._symbol,
			this._symbolHandle,
			this._marshal,
			this._syncMode,
			this._options?.isWrappable,
		)
	}

	_unwrap<T>(target: T): T {
		return unwrap(target, this._symbol)
	}

	_unwrapIfNotSynced = <T>(target: T): T => {
		const unwrapped = this._unwrap(target)
		return unwrapped instanceof Promise || !this._sync.has(unwrapped) ? unwrapped : target
	}

	_wrapHandle(handle: QuickJSHandle): [Wrapped<QuickJSHandle> | undefined, boolean] {
		return wrapHandle(
			this.context,
			handle,
			this._symbol,
			this._symbolHandle,
			this._unmarshal,
			this._syncMode,
			this._options?.isHandleWrappable,
		)
	}

	_unwrapHandle(target: QuickJSHandle): [QuickJSHandle, boolean] {
		return unwrapHandle(this.context, target, this._symbolHandle)
	}
}

export class AsyncArena extends Arena {
	asyncContext: QuickJSAsyncContext

	constructor(ctx: QuickJSAsyncContext, options?: Options) {
		super(ctx, options)
		this.asyncContext = ctx
	}
	/**
	 * Evaluate JS code in the VM and get the result as an object on the host side. It also converts and re-throws error objects when an error is thrown during evaluation.
	 */
	async evalCodeAsync<T = any>(code: string, ...args): Promise<T> {
		const handle = await this.asyncContext.evalCodeAsync(code, ...args)
		return this._unwrapResultAndUnmarshal(handle)
	}
}
