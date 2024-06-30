import { getQuickJS } from 'quickjs-emscripten'
import type { Disposable, QuickJSDeferredPromise, QuickJSHandle } from 'quickjs-emscripten-core'
import { expect, test, vi } from 'vitest'

import { newDeferred } from '../util'
import { fn, json } from '../vmutil'

import marshalPromise from './promise'

const testPromise = (reject: boolean) => async () => {
	const ctx = (await getQuickJS()).newContext()

	const disposables: Disposable[] = []
	const marshal = vi.fn(v => {
		const handle = json(ctx, v)
		disposables.push(handle)
		return handle
	})
	const preMarshal = vi.fn((_: any, a: QuickJSDeferredPromise): QuickJSHandle => {
		disposables.push(a)
		return a.handle
	})

	const mockNotify = vi.fn()
	const notify = ctx.newFunction('notify', (handle1, handle2) => {
		const arg1 = ctx.dump(handle1)
		const arg2 = ctx.dump(handle2)
		mockNotify(arg1, arg2)
	})
	disposables.push(notify)

	const notifier = fn(
		ctx,
		`(notify, promise) => { promise.then(d => notify("resolved", d), d => notify("rejected", d)); }`,
	)
	disposables.push(notifier)

	const deferred = newDeferred()
	if (reject) {
		deferred.promise.catch(() => {})
	}
	const handle = marshalPromise(ctx, deferred.promise, marshal, preMarshal)
	if (!handle) throw new Error('handle is undefined')

	expect(marshal).toBeCalledTimes(0)
	expect(preMarshal).toBeCalledTimes(1)
	expect(preMarshal.mock.calls[0][0]).toBe(deferred.promise)
	expect(preMarshal.mock.calls[0][1].handle).toBe(handle)

	notifier(undefined, notify, handle)

	expect(mockNotify).toBeCalledTimes(0)
	expect(deferred.resolve).not.toBeUndefined()
	expect(ctx.runtime.hasPendingJob()).toBe(false)

	if (reject) {
		deferred.reject('hoge')
	} else {
		deferred.resolve('hoge')
	}

	expect(ctx.runtime.hasPendingJob()).toBe(false)
	if (reject) {
		await expect(deferred.promise).rejects.toBe('hoge')
	} else {
		await expect(deferred.promise).resolves.toBe('hoge')
	}
	// no need call executePendingJobs, it is called by promise.settled
	// expect(ctx.runtime.hasPendingJob()).toBe(true);
	// const executed = ctx.unwrapResult(ctx.runtime.executePendingJobs());
	// expect(executed).toBe(1);
	expect(mockNotify).toBeCalledTimes(1)
	expect(mockNotify).toBeCalledWith(reject ? 'rejected' : 'resolved', 'hoge')
	expect(marshal).toBeCalledTimes(1)
	expect(marshal.mock.calls).toEqual([['hoge']])

	disposables.forEach(h => h.dispose())
	ctx.dispose()
}

test('resolve', testPromise(false))
test('reject', testPromise(true))
