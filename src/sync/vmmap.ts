import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

export default class VMMap {
	ctx: QuickJSContext
	_map1: Map<any, number> = new Map()
	_map2: Map<any, number> = new Map()
	_map3: Map<number, QuickJSHandle> = new Map()
	_map4: Map<number, QuickJSHandle> = new Map()
	_counterMap: Map<number, any> = new Map()
	_disposables: Set<QuickJSHandle> = new Set()
	_mapGet: QuickJSHandle
	_mapSet: QuickJSHandle
	_mapDelete: QuickJSHandle
	_mapClear: QuickJSHandle
	_counter = Number.MIN_SAFE_INTEGER

	constructor(ctx: QuickJSContext) {
		this.ctx = ctx

		const result = ctx
			.unwrapResult(
				ctx.evalCode(`() => {
        const mapSym = new Map();
        let map = new WeakMap();
        let map2 = new WeakMap();
        const isObj = o => typeof o === "object" && o !== null || typeof o === "function";
        return {
          get: key => mapSym.get(key) ?? map.get(key) ?? map2.get(key) ?? -1,
          set: (key, value, key2) => {
            if (typeof key === "symbol") mapSym.set(key, value);
            if (isObj(key)) map.set(key, value);
            if (isObj(key2)) map2.set(key2, value);
          },
          delete: (key, key2) => {
            mapSym.delete(key);
            map.delete(key);
            map2.delete(key2);
          },
          clear: () => {
            mapSym.clear();
            map = new WeakMap();
            map2 = new WeakMap();
          }
        };
      }`),
			)
			.consume(fn => this._call(fn, undefined))

		this._mapGet = ctx.getProp(result, 'get')
		this._mapSet = ctx.getProp(result, 'set')
		this._mapDelete = ctx.getProp(result, 'delete')
		this._mapClear = ctx.getProp(result, 'clear')

		result.dispose()

		this._disposables.add(this._mapGet)
		this._disposables.add(this._mapSet)
		this._disposables.add(this._mapDelete)
		this._disposables.add(this._mapClear)
	}

	set(key: any, handle: QuickJSHandle, key2?: any, handle2?: QuickJSHandle): boolean {
		if (!handle.alive || (handle2 && !handle2.alive)) return false

		const v = this.get(key) ?? this.get(key2)
		if (v) {
			// handle and handle2 are unused so they should be disposed
			return v === handle || v === handle2
		}

		const counter = this._counter++
		this._map1.set(key, counter)
		this._map3.set(counter, handle)
		this._counterMap.set(counter, key)
		if (key2) {
			this._map2.set(key2, counter)
			if (handle2) {
				this._map4.set(counter, handle2)
			}
		}

		this.ctx.newNumber(counter).consume(c => {
			this._call(this._mapSet, undefined, handle, c, handle2 ?? this.ctx.undefined)
		})

		return true
	}

	merge(
		iteratable:
			| Iterable<[any, QuickJSHandle | undefined] | [any, QuickJSHandle | undefined, any, QuickJSHandle | undefined]>
			| undefined,
	) {
		if (!iteratable) return
		for (const iter of iteratable) {
			if (!iter) continue
			if (iter[1]) {
				this.set(iter[0], iter[1], iter[2], iter[3])
			}
		}
	}

	get(key: any) {
		const num = this._map1.get(key) ?? this._map2.get(key)
		const handle = typeof num === 'number' ? this._map3.get(num) : undefined

		if (!handle) return
		if (!handle.alive) {
			this.delete(key)
			return
		}

		return handle
	}

	getByHandle(handle: QuickJSHandle) {
		if (!handle.alive) {
			return
		}
		return this._counterMap.get(this.ctx.getNumber(this._call(this._mapGet, undefined, handle)))
	}

	has(key: any) {
		return !!this.get(key)
	}

	hasHandle(handle: QuickJSHandle) {
		return typeof this.getByHandle(handle) !== 'undefined'
	}

	keys() {
		return this._map1.keys()
	}

	delete(key: any, dispose?: boolean) {
		const num = this._map1.get(key) ?? this._map2.get(key)
		if (typeof num === 'undefined') return

		const handle = this._map3.get(num)
		const handle2 = this._map4.get(num)
		this._call(this._mapDelete, undefined, ...[handle, handle2].filter((h): h is QuickJSHandle => !!h?.alive))

		this._map1.delete(key)
		this._map2.delete(key)
		this._map3.delete(num)
		this._map4.delete(num)

		for (const [k, v] of this._map1) {
			if (v === num) {
				this._map1.delete(k)
				break
			}
		}

		for (const [k, v] of this._map2) {
			if (v === num) {
				this._map2.delete(k)
				break
			}
		}

		for (const [k, v] of this._counterMap) {
			if (v === key) {
				this._counterMap.delete(k)
				break
			}
		}

		if (dispose) {
			if (handle?.alive) handle.dispose()
			if (handle2?.alive) handle2.dispose()
		}
	}

	deleteByHandle(handle: QuickJSHandle, dispose?: boolean) {
		const key = this.getByHandle(handle)
		if (typeof key !== 'undefined') {
			this.delete(key, dispose)
		}
	}

	clear() {
		this._counter = 0
		this._map1.clear()
		this._map2.clear()
		this._map3.clear()
		this._map4.clear()
		this._counterMap.clear()
		if (this._mapClear.alive) {
			this._call(this._mapClear, undefined)
		}
	}

	dispose() {
		for (const v of this._disposables.values()) {
			if (v.alive) {
				v.dispose()
			}
		}
		for (const v of this._map3.values()) {
			if (v.alive) {
				v.dispose()
			}
		}
		for (const v of this._map4.values()) {
			if (v.alive) {
				v.dispose()
			}
		}
		this._disposables.clear()
		this.clear()
	}

	get size() {
		return this._map1.size
	}

	[Symbol.iterator](): Iterator<[any, QuickJSHandle, any, QuickJSHandle | undefined]> {
		const keys = this._map1.keys()
		return {
			next: () => {
				// eslint-disable-next-line no-constant-condition
				while (true) {
					const k1 = keys.next()
					if (k1.done) return { value: undefined, done: true }
					const n = this._map1.get(k1.value)
					if (typeof n === 'undefined') continue
					const v1 = this._map3.get(n)
					const v2 = this._map4.get(n)
					if (!v1) continue
					const k2 = this._get2(n)
					return { value: [k1.value, v1, k2, v2], done: false }
				}
			},
		}
	}

	_get2(num: number) {
		for (const [k, v] of this._map2) {
			if (v === num) return k
		}
	}

	_call(fn: QuickJSHandle, thisArg: QuickJSHandle | undefined, ...args: QuickJSHandle[]) {
		return this.ctx.unwrapResult(
			this.ctx.callFunction(fn, typeof thisArg === 'undefined' ? this.ctx.undefined : thisArg, ...args),
		)
	}
}
