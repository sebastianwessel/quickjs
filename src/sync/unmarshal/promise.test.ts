import { expect, mock, test } from 'bun:test'
import { getQuickJS } from 'quickjs-emscripten'
import type { Disposable, QuickJSHandle } from 'quickjs-emscripten-core'

import unmarshalPromise from './promise.js'

const testPromise = (reject: boolean) => async () => {
	const ctx = (await getQuickJS()).newContext()
	const disposables: Disposable[] = []
	const marshal = mock((v): [QuickJSHandle, boolean] => {
		const f = ctx.newFunction(v.name, h => {
			v(ctx.dump(h))
		})
		disposables.push(f)
		return [f, false]
	})
	const preUnmarshal = mock(a => a)

	const deferred = ctx.newPromise()
	disposables.push(deferred)
	const promise = unmarshalPromise(ctx, deferred.handle, marshal, preUnmarshal)

	expect(marshal).toBeCalledTimes(2)
	expect(preUnmarshal).toBeCalledTimes(1)
	expect(ctx.runtime.hasPendingJob()).toBe(false)

	if (reject) {
		deferred.reject(ctx.newString('hoge'))
	} else {
		deferred.resolve(ctx.newString('hoge'))
	}
	expect(ctx.runtime.hasPendingJob()).toBe(true)
	expect(ctx.unwrapResult(ctx.runtime.executePendingJobs())).toBe(1)
	if (reject) {
		expect(promise).rejects.toThrow('hoge')
	} else {
		expect(promise).resolves.toBe('hoge')
	}

	disposables.forEach(d => d.dispose())
	ctx.dispose()
}

test('resolve', testPromise(false))
test('reject', testPromise(true))
