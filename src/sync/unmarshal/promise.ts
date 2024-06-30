import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { newDeferred } from '../util.js'
import { call, instanceOf } from '../vmutil.js'

export default function unmarshalPromise<T = unknown>(
	ctx: QuickJSContext,
	handle: QuickJSHandle,
	/** marshal returns handle and boolean indicates that the handle should be disposed after use */
	marshal: (value: unknown) => [QuickJSHandle, boolean],
	preUnmarshal: <T>(target: T, handle: QuickJSHandle) => T | undefined,
): Promise<T> | undefined {
	if (!isPromiseHandle(ctx, handle)) return

	const deferred = newDeferred<T>()
	const [resHandle, resShouldBeDisposed] = marshal(deferred.resolve)
	const [rejHandle, rejShouldBeDisposed] = marshal(deferred.reject)
	call(ctx, '(p, res, rej) => { p.then(res, rej); }', undefined, handle, resHandle, rejHandle)
	if (resShouldBeDisposed) resHandle.dispose()
	if (rejShouldBeDisposed) rejHandle.dispose()

	return preUnmarshal(deferred.promise, handle) ?? deferred.promise
}

function isPromiseHandle(ctx: QuickJSContext, handle: QuickJSHandle): boolean {
	if (!handle.owner) return false
	return ctx.unwrapResult(ctx.evalCode('Promise')).consume(promise => {
		if (!handle.owner) return false
		return instanceOf(ctx, handle, promise)
	})
}
