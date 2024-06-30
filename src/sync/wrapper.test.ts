import { getQuickJS } from 'quickjs-emscripten'
import type { QuickJSHandle } from 'quickjs-emscripten-core'
import { expect, test, vi } from 'vitest'

import { call, eq, json } from './vmutil.js'
import { type SyncMode, isHandleWrapped, isWrapped, unwrap, unwrapHandle, wrap, wrapHandle } from './wrapper.js'

test('wrap, unwrap, isWrapped', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const marshal = vi.fn()
	const syncMode = vi.fn()

	expect(isWrapped(target, proxyKeySymbol)).toBe(false)
	expect(unwrap(target, proxyKeySymbol)).toBe(target)

	const wrapped = wrap(ctx, target, proxyKeySymbol, proxyKeySymbolHandle, marshal, syncMode)
	if (!wrapped) throw new Error('wrapped is undefined')

	expect(wrapped).toEqual(target)
	expect(isWrapped(wrapped, proxyKeySymbol)).toBe(true)
	expect(unwrap(wrapped, proxyKeySymbol)).toBe(target)

	expect(wrap(ctx, wrapped, proxyKeySymbol, proxyKeySymbolHandle, marshal, syncMode)).toBe(wrapped)

	// promise cannot be wrapped
	expect(wrap(ctx, Promise.resolve(1), proxyKeySymbol, proxyKeySymbolHandle, marshal, syncMode)).toBeUndefined()

	proxyKeySymbolHandle.dispose()
	handle.dispose()
	ctx.dispose()
})

test('wrap without sync', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const marshal = vi.fn()
	const syncMode = vi.fn()

	const wrapped = wrap(ctx, target, proxyKeySymbol, proxyKeySymbolHandle, marshal, syncMode)
	if (!wrapped) throw new Error('wrapped is undefined')

	expect(marshal).toBeCalledTimes(0)
	expect(syncMode).toBeCalledTimes(0)

	wrapped.a = 2

	expect(target.a).toBe(2)
	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(1) // not synced
	expect(marshal).toBeCalledTimes(0)
	expect(syncMode).toBeCalledTimes(1)
	expect(syncMode).toBeCalledWith(wrapped)

	proxyKeySymbolHandle.dispose()
	handle.dispose()
	ctx.dispose()

	wrapped.a = 3 // no error even if vm is disposed
	expect(wrapped.a).toBe(3)
})

test('wrap with both sync', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 } as { a?: number }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const marshal = vi.fn((t: any): [QuickJSHandle, boolean] => [t === wrapped ? handle : json(ctx, t), false])
	const syncMode = vi.fn((): SyncMode => 'both')

	const wrapped = wrap(ctx, target, proxyKeySymbol, proxyKeySymbolHandle, marshal, syncMode)
	if (!wrapped) throw new Error('wrapped is undefined')

	expect(marshal).toBeCalledTimes(0)
	expect(syncMode).toBeCalledTimes(0)

	wrapped.a = 2

	expect(target.a).toBe(2)
	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(2) // synced
	expect(marshal).toBeCalledTimes(3)
	expect(marshal).toBeCalledWith(2)
	expect(marshal).toBeCalledWith('a')
	expect(syncMode).toBeCalledTimes(1)
	expect(syncMode).toBeCalledWith(wrapped)

	wrapped.a = undefined
	expect(target.a).toBe(undefined)
	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(undefined) // synced

	proxyKeySymbolHandle.dispose()
	handle.dispose()
	ctx.dispose()

	wrapped.a = 3 // no error even if vm is disposed
	expect(wrapped.a).toBe(3)
})

test('wrap with vm sync', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 } as { a?: number }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const marshal = vi.fn((t: any): [QuickJSHandle, boolean] => [t === wrapped ? handle : json(ctx, t), false])
	const syncMode = vi.fn((): SyncMode => 'vm')

	const wrapped = wrap(ctx, target, proxyKeySymbol, proxyKeySymbolHandle, marshal, syncMode)
	if (!wrapped) throw new Error('wrapped is undefined')

	expect(marshal).toBeCalledTimes(0)
	expect(syncMode).toBeCalledTimes(0)

	wrapped.a = 2

	expect(target.a).toBe(1) // not set
	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(2) // synced
	expect(marshal).toBeCalledTimes(3)
	expect(marshal).toBeCalledWith(2)
	expect(marshal).toBeCalledWith('a')
	expect(syncMode).toBeCalledTimes(1)
	expect(syncMode).toBeCalledWith(wrapped)

	wrapped.a = undefined
	expect(target.a).toBe(1) // not deleted
	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(undefined) // synced

	proxyKeySymbolHandle.dispose()
	handle.dispose()
	ctx.dispose()

	wrapped.a = 3 // no error even after vm is disposed
	expect(wrapped.a).toBe(1) // vm mode cannot modify obj in host
})

test('wrapHandle, unwrapHandle, isHandleWrapped', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const unmarshal = vi.fn()
	const syncMode = vi.fn()

	expect(isHandleWrapped(ctx, handle, proxyKeySymbolHandle)).toBe(false)
	expect(unwrapHandle(ctx, handle, proxyKeySymbolHandle)).toEqual([handle, false])

	const [wrapped, w] = wrapHandle(ctx, handle, proxyKeySymbol, proxyKeySymbolHandle, unmarshal, syncMode)
	if (!wrapped || !w) throw new Error('wrapped is undefined')

	expect(ctx.dump(wrapped)).toEqual(target) // vm.dump does not support proxies
	expect(ctx.dump(ctx.getProp(wrapped, 'a'))).toBe(1)
	expect(isHandleWrapped(ctx, wrapped, proxyKeySymbolHandle)).toBe(true)

	const [handle2, unwrapped2] = unwrapHandle(ctx, wrapped, proxyKeySymbolHandle)
	expect(unwrapped2).toBe(true)
	handle2.consume(h => {
		expect(eq(ctx, handle, h)).toBe(true)
	})

	const [wrapped2] = wrapHandle(ctx, wrapped, proxyKeySymbol, proxyKeySymbolHandle, unmarshal, syncMode)
	expect(wrapped2 === wrapped).toBe(true)

	// promise cannot be wrapped
	const deferred = ctx.newPromise()
	expect(isHandleWrapped(ctx, deferred.handle, proxyKeySymbolHandle)).toBe(true)

	deferred.dispose()
	wrapped.dispose()
	handle.dispose()
	proxyKeySymbolHandle.dispose()
	ctx.dispose()
})

test('wrapHandle without sync', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const unmarshal = vi.fn((h: QuickJSHandle) => (wrapped && eq(ctx, h, wrapped) ? target : ctx.dump(h)))
	const syncMode = vi.fn()

	const [wrapped, w] = wrapHandle(ctx, handle, proxyKeySymbol, proxyKeySymbolHandle, unmarshal, syncMode)
	if (!wrapped || !w) throw new Error('wrapped is undefined')

	expect(unmarshal).toBeCalledTimes(0)
	expect(syncMode).toBeCalledTimes(0)

	call(ctx, 'a => a.a = 2', undefined, wrapped)

	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(2)
	expect(target.a).toBe(1) // not synced
	expect(unmarshal).toBeCalledTimes(1)
	expect(unmarshal).toReturnWith(target)
	expect(syncMode).toBeCalledTimes(1)
	expect(syncMode).toBeCalledWith(target)

	wrapped.dispose()
	handle.dispose()
	proxyKeySymbolHandle.dispose()
	ctx.dispose()
})

test('wrapHandle with both sync', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const unmarshal = vi.fn((h: QuickJSHandle) => {
		return wrapped && eq(ctx, h, wrapped) ? target : ctx.dump(h)
	})
	const syncMode = vi.fn((): SyncMode => 'both')

	const [wrapped, w] = wrapHandle(ctx, handle, proxyKeySymbol, proxyKeySymbolHandle, unmarshal, syncMode)
	if (!wrapped || !w) throw new Error('wrapped is undefined')

	expect(unmarshal).toBeCalledTimes(0)
	expect(syncMode).toBeCalledTimes(0)

	call(ctx, 'a => a.a = 2', undefined, wrapped)

	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(2)
	expect(target.a).toBe(2) // synced
	expect(unmarshal).toBeCalledTimes(4)
	expect(unmarshal).toReturnWith(target) // twice
	expect(unmarshal).toReturnWith('a')
	expect(unmarshal).toReturnWith(2)
	expect(syncMode).toBeCalledTimes(1)
	expect(syncMode).toBeCalledWith(target)

	call(ctx, 'a => { delete a.a; }', undefined, wrapped)
	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(undefined)
	expect(target.a).toBe(undefined) // synced

	// changing __proto__ will be blocked
	call(ctx, 'a => { a.__proto__ = null; }', undefined, wrapped)
	expect(ctx.dump(call(ctx, 'Object.getPrototypeOf', undefined, handle))).toBe(null)
	expect(Object.getPrototypeOf(target)).toBe(Object.prototype) // not changed

	wrapped.dispose()
	handle.dispose()
	proxyKeySymbolHandle.dispose()
	ctx.dispose()
})

test('wrapHandle with host sync', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const unmarshal = vi.fn((handle: QuickJSHandle) => (wrapped && eq(ctx, handle, wrapped) ? target : ctx.dump(handle)))
	const syncMode = vi.fn((): SyncMode => 'host')

	const [wrapped, w] = wrapHandle(ctx, handle, proxyKeySymbol, proxyKeySymbolHandle, unmarshal, syncMode)
	if (!wrapped || !w) throw new Error('wrapped is undefined')

	expect(unmarshal).toBeCalledTimes(0)
	expect(syncMode).toBeCalledTimes(0)

	call(ctx, 'a => a.a = 2', undefined, wrapped)

	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(1) // not set
	expect(target.a).toBe(2) // synced
	expect(unmarshal).toBeCalledTimes(4)
	expect(unmarshal).toReturnWith(target) // twice
	expect(unmarshal).toReturnWith('a')
	expect(unmarshal).toReturnWith(2)
	expect(syncMode).toBeCalledTimes(1)
	expect(syncMode).toBeCalledWith(target)

	call(ctx, 'a => delete a.a', undefined, handle)
	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(undefined)
	expect(target.a).toBe(2) // not synced

	wrapped.dispose()
	handle.dispose()
	proxyKeySymbolHandle.dispose()
	ctx.dispose()
})

test('wrap and wrapHandle', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = { a: 1 }
	const handle = ctx.unwrapResult(ctx.evalCode('({ a: 1 })'))
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))
	const marshal = vi.fn((t: any): [QuickJSHandle, boolean] => [
		wrappedHandle && t === wrapped ? wrappedHandle : json(ctx, t),
		false,
	])
	const unmarshal = vi.fn((handle: QuickJSHandle) =>
		wrappedHandle && eq(ctx, handle, wrappedHandle) ? wrapped : ctx.dump(handle),
	)
	const syncMode = vi.fn((): SyncMode => 'both')

	const wrapped = wrap(ctx, target, proxyKeySymbol, proxyKeySymbolHandle, marshal, syncMode)
	if (!wrapped) throw new Error('wrapped is undefined')
	const [wrappedHandle, w] = wrapHandle(ctx, handle, proxyKeySymbol, proxyKeySymbolHandle, unmarshal, syncMode)
	if (!wrappedHandle || !w) throw new Error('wrappedHandle is undefined')

	call(ctx, 'a => a.a = 2', undefined, wrappedHandle)

	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(2)
	expect(target.a).toBe(2)
	expect(marshal).toBeCalledTimes(0)
	expect(unmarshal).toBeCalledTimes(4)
	expect(unmarshal).toReturnWith(wrapped) // twice
	expect(unmarshal).toReturnWith('a')
	expect(unmarshal).toReturnWith(2)

	marshal.mockClear()
	unmarshal.mockClear()

	wrapped.a = 3

	expect(ctx.dump(ctx.getProp(handle, 'a'))).toBe(3)
	expect(target.a).toBe(3)
	expect(marshal).toBeCalledTimes(3)
	expect(marshal).toBeCalledWith(wrapped)
	expect(marshal).toBeCalledWith('a')
	expect(marshal).toBeCalledWith(3)
	expect(unmarshal).toBeCalledTimes(0)

	wrappedHandle.dispose()
	handle.dispose()
	proxyKeySymbolHandle.dispose()
	ctx.dispose()
})

test('non object', async () => {
	const ctx = (await getQuickJS()).newContext()
	const target = 1
	const handle = ctx.newNumber(1)
	const proxyKeySymbol = Symbol()
	const proxyKeySymbolHandle = ctx.unwrapResult(ctx.evalCode('Symbol()'))

	expect(wrap(ctx, target, proxyKeySymbol, proxyKeySymbolHandle, vi.fn(), vi.fn())).toBe(undefined)

	expect(wrapHandle(ctx, handle, proxyKeySymbol, proxyKeySymbolHandle, vi.fn(), vi.fn())).toEqual([undefined, false])

	proxyKeySymbolHandle.dispose()
	ctx.dispose()
})
