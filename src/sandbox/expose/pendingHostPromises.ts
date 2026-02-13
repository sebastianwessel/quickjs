import type { QuickJSAsyncContext, QuickJSContext, QuickJSDeferredPromise } from 'quickjs-emscripten-core'

type ContextType = QuickJSContext | QuickJSAsyncContext

const pendingHostPromises = new WeakMap<ContextType, Set<QuickJSDeferredPromise>>()

export const registerPendingHostPromise = (ctx: ContextType, promise: QuickJSDeferredPromise) => {
	const current = pendingHostPromises.get(ctx)
	if (current) {
		current.add(promise)
		return
	}
	pendingHostPromises.set(ctx, new Set([promise]))
}

export const unregisterPendingHostPromise = (ctx: ContextType, promise: QuickJSDeferredPromise) => {
	const current = pendingHostPromises.get(ctx)
	if (!current) {
		return
	}
	current.delete(promise)
	if (current.size === 0) {
		pendingHostPromises.delete(ctx)
	}
}

export const rejectAndFlushPendingHostPromises = async (
	ctx: ContextType,
	message = 'Sandbox timed out before async host call finished.',
	maxWaitMs = 100,
) => {
	const current = pendingHostPromises.get(ctx)
	if (!current || current.size === 0) {
		return
	}

	const pending = Array.from(current)

	for (const deferred of pending) {
		try {
			const errHandle = ctx.newError(new Error(message))
			deferred.reject(errHandle)
			errHandle.dispose()
		} catch {
			// ignore rejected/dead deferred or context teardown race
		}
	}

	await Promise.race([
		Promise.allSettled(pending.map(p => p.settled)),
		new Promise(resolve => setTimeout(resolve, maxWaitMs)),
	])
}
