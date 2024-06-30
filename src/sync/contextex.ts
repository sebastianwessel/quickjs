import type { QuickJSContext, QuickJSHandle, VmFunctionImplementation } from 'quickjs-emscripten-core'

export type QuickJSContextEx = QuickJSContext & {
	disposeEx?: () => void
}

export const wrapContext = (ctx: QuickJSContext): QuickJSContextEx => {
	const ctxex = new ContextEx(ctx)
	return new Proxy(ctx, {
		get(target, p, receiver) {
			return p in ctxex ? (ctxex as any)[p] : Reflect.get(target, p, receiver)
		},
	}) as QuickJSContextEx
}

export class ContextEx {
	context: QuickJSContext
	fn: QuickJSHandle
	fnGenerator: QuickJSHandle
	fnCounter = Number.MIN_SAFE_INTEGER
	fnMap = new Map<number, VmFunctionImplementation<QuickJSHandle>>()

	constructor(context: QuickJSContext) {
		this.context = context
		const fnMap = this.fnMap
		this.fn = this.context.newFunction('', function (idHandle, ...argHandles) {
			const id = context.getNumber(idHandle)
			const f = fnMap.get(id)
			if (!f) throw new Error('function is not registered')
			return f.call(this, ...argHandles)
		})
		this.fnGenerator = context.unwrapResult(
			context.evalCode(`((name, length, id, f) => {
        const fn = function(...args) {
          return f.call(this, id, ...args);
        };
        fn.name = name;
        fn.length = length;
        return fn;
      })`),
		)
	}

	disposeEx(): void {
		this.fnGenerator.dispose()
		this.fn.dispose()
	}

	/** Similar to the original newFunction, but no matter how many new functions are generated, newFunction is called only once. */
	newFunction = (name: string, fn: VmFunctionImplementation<QuickJSHandle>): QuickJSHandle => {
		this.fnCounter++
		const id = this.fnCounter
		this.fnMap.set(id, fn)
		return this.context.unwrapResult(
			this.context.callFunction(
				this.fnGenerator,
				this.context.undefined,
				this.context.newString(name),
				this.context.newNumber(fn.length),
				this.context.newNumber(id),
				this.fn,
			),
		)
	}
}
