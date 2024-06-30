import type { QuickJSContext, QuickJSDeferredPromise, QuickJSHandle } from 'quickjs-emscripten-core'

export default function marshalPromise(
	ctx: QuickJSContext,
	target: unknown,
	marshal: (target: unknown) => QuickJSHandle,
	preMarshal: (target: unknown, handle: QuickJSDeferredPromise) => QuickJSHandle | undefined,
) {
	if (!(target instanceof Promise)) return

	const promise = ctx.newPromise()

	promise.settled.then(ctx.runtime.executePendingJobs)

	target.then(
		d => promise.resolve(marshal(d)),
		d => promise.reject(marshal(d)),
	)

	return preMarshal(target, promise) ?? promise.handle
}
