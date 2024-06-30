import { expect, test, vi } from 'vitest'

import { complexity, isES2015Class, isObject, newDeferred, walkObject } from './util.js'

test('isES2015Class', () => {
	expect(isES2015Class(class {})).toBe(true)
	expect(isES2015Class(class A {})).toBe(true)
	expect(isES2015Class(() => {})).toBe(false)
	expect(isES2015Class(function A() {})).toBe(false)
	expect(isES2015Class(() => {})).toBe(false)
	expect(isES2015Class({})).toBe(false)
	expect(isES2015Class(1)).toBe(false)
	expect(isES2015Class(true)).toBe(false)
})

test('isObject', () => {
	expect(isObject({})).toBe(true)
	expect(isObject(Object.create(null))).toBe(true)
	expect(isObject(() => {})).toBe(true)
	expect(isObject(function A() {})).toBe(true)
	expect(isObject(() => {})).toBe(true)
	expect(isObject(class {})).toBe(true)
	expect(isObject(class A {})).toBe(true)
	expect(isObject(null)).toBe(false)
	expect(isObject(1)).toBe(false)
	expect(isObject(true)).toBe(false)
})

test('walkObject', () => {
	const cb = vi.fn()
	const obj = { a: { b: 1, c: () => {} } }
	const set = new Set<any>([obj, obj.a, obj.a.c])
	expect(walkObject(obj, cb)).toEqual(set)
	expect(cb).toBeCalledTimes(3)
	expect(cb).toBeCalledWith(obj, set)
	expect(cb).toBeCalledWith(obj.a, set)
	expect(cb).toBeCalledWith(obj.a.c, set)
})

test('complexity', () => {
	expect(complexity(0)).toBe(0)
	expect(complexity(Number.NaN)).toBe(0)
	expect(complexity(true)).toBe(0)
	expect(complexity(false)).toBe(0)
	expect(complexity(null)).toBe(0)
	expect(complexity(undefined)).toBe(0)
	expect(complexity([])).toBe(1)
	expect(complexity({})).toBe(1)
	expect(complexity({ a: 1 })).toBe(1)
	expect(complexity(() => {})).toBe(1)
	expect(complexity([{}])).toBe(2)
	expect(complexity(() => {})).toBe(2)
	expect(complexity(class {})).toBe(2)
	expect(complexity({ a: {} })).toBe(2)
	expect(complexity({ a: {} }, 1)).toBe(1)
})

test('newDeferred', () => {
	const deferred = newDeferred()
	deferred.resolve('foo')
	expect(deferred.promise).resolves.toBe('foo')

	const deferred2 = newDeferred()
	deferred2.reject('bar')
	expect(deferred2.promise).rejects.toBe('bar')
})
