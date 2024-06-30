export function isES2015Class(cls: any): cls is new (...args: any[]) => any {
	return typeof cls === 'function' && /^class\s/.test(Function.prototype.toString.call(cls))
}

export function isObject(value: any): value is object | Function {
	return typeof value === 'function' || (typeof value === 'object' && value !== null)
}

export function walkObject(value: any, callback?: (target: any, set: Set<any>) => boolean | undefined): Set<any> {
	const set = new Set<any>()
	const walk = (v: any) => {
		if (!isObject(v) || set.has(v) || callback?.(v, set) === false) return
		set.add(v)

		if (Array.isArray(v)) {
			for (const e of v) {
				walk(e)
			}
			return
		}

		if (typeof v === 'object') {
			const proto = Object.getPrototypeOf(v)
			if (proto && proto !== Object.prototype) {
				walk(proto)
			}
		}

		for (const d of Object.values(Object.getOwnPropertyDescriptors(v))) {
			if ('value' in d) walk(d.value)
			if ('get' in d) walk(d.get)
			if ('set' in d) walk(d.set)
		}
	}

	walk(value)
	return set
}

/**
 * Measure the complexity of an object as you traverse the field and prototype chain. If max is specified, when the complexity reaches max, the traversal is terminated and it returns the max. In this function, one object and function are counted as a complexity of 1, and primitives are not counted as a complexity.
 */
export function complexity(value: any, max?: number): number {
	return walkObject(value, max ? (_, set) => set.size < max : undefined).size
}

export function newDeferred<T = unknown>() {
	let res: (v: T | PromiseLike<T>) => void = () => {}
	let rej: (v: T | PromiseLike<T>) => void = () => {}
	const promise = new Promise<T>((resolve, reject) => {
		res = resolve
		rej = reject
	})

	return {
		promise,
		resolve: res,
		reject: rej,
	}
}
