import type { QuickJSContext, QuickJSDeferredPromise, QuickJSHandle, VmCallResult } from 'quickjs-emscripten'
import { getProps, isObject } from './utils'

export class RuntimeValueTransformer {
  private _ctx: QuickJSContext
  private _anonymousFnIndex: number = 0
  private _skippableProps: string[] = getProps({})
  private _classOf: QuickJSHandle
  private _handles: (QuickJSHandle | QuickJSDeferredPromise)[] = []

  constructor(ctx: QuickJSContext) {
    this._ctx = ctx
    this._classOf = this._initClassOf()
  }

  private _registerHandle<T extends QuickJSHandle | QuickJSDeferredPromise>(handle: T): T {
    this._handles.push(handle)
    return handle
  }

  get handles() {
    return this._handles
  }

  private _initClassOf(): QuickJSHandle {
    return this._registerHandle(this._ctx.unwrapResult(this._ctx.evalCode(`value => { return ({}).toString.call(value) }`)))
  }

  classOf(value: QuickJSHandle) {
    const rawClass = this._ctx.callFunction(this._classOf, this._ctx.null, value)
    return this._ctx.getString(this._registerHandle(this._ctx.unwrapResult(rawClass))).slice(8, -1)
  }

  wrapNativeError(err: Error): QuickJSHandle {
    return this._registerHandle(this._ctx.newError({ name: err.name, message: err.message }))
  }

  wrapNativeValue(value: unknown, ctx: Record<PropertyKey, unknown> | null = null): QuickJSHandle {
    if (value instanceof Error) {
      return this.wrapNativeError(value)
    }
    if (value instanceof Promise) {
      return this.wrapNativePromise(value)
    }
    if (value instanceof ArrayBuffer) {
      return this.wrapNativeArrayBuffer(value)
    }
    if (Array.isArray(value)) {
      return this.wrapNativeArray(value)
    }
    if (typeof value === 'function') {
      return this.wrapNativeFn(value as (...args: unknown[]) => unknown, ctx)
    }
    if (isObject(value)) {
      return this.wrapNativeObject(value)
    }
    return this.wrapNativePrimitive(value)
  }

  wrapNativePrimitive(value: unknown): QuickJSHandle {
    switch (typeof value) {
      case 'boolean': {
        return value ? this._registerHandle(this._ctx.true) : this._registerHandle(this._ctx.false)
      }
      case 'object': {
        // Let's doublecheck
        if (value) throw new Error('Only primitives are allowed as inputs for "wrapNativePrimitive"')
        return this._registerHandle(this._ctx.null)
      }
      case 'bigint': {
        return this._registerHandle(this._ctx.newBigInt(value))
      }
      case 'function': {
        throw new Error('Only primitives are allowed as inputs for "wrapNativePrimitive"')
      }
      case 'number': {
        return this._registerHandle(this._ctx.newNumber(value))
      }
      case 'string': {
        return this._registerHandle(this._ctx.newString(value))
      }
      case 'symbol': {
        /** @TODO Support symbols */
        throw new Error('Symbols are not yet supported in "wrapNativePrimitive"')
      }
      case 'undefined': {
        return this._registerHandle(this._ctx.undefined)
      }
    }
    throw new Error('Type of value is unknown ("wrapNativePrimitive")')
  }

  unwrap(result: VmCallResult<QuickJSHandle>): QuickJSHandle {
    try {
      return this._ctx.unwrapResult(result)
    } catch (err) {
      throw (err as Error).cause
    }
  }

  async parseEvalCodeResult(result: VmCallResult<QuickJSHandle>): Promise<unknown> {
    // Safe async wrapper protects from "hanging promise" CloudFlare error
    const safe = this._ctx.newPromise()
    this._registerHandle(safe.handle)
    safe.settled.then(() => this._ctx.runtime.executePendingJobs())
    safe.resolve(this._registerHandle(this.unwrap(result)))
    const wrappedValue = await this._ctx.resolvePromise(safe.handle)
    const h = this._registerHandle(this.unwrap(wrappedValue))
    const value = this.parseQJSHandle(h)
    safe.dispose()
    return value
  }

  parseTypedQJSHandle(handle: QuickJSHandle): any {
    return {
      type: this._ctx.typeof(handle),
      ctr: this.classOf(handle),
      value: this.parseQJSHandle(handle),
    }
  }

  parseQJSHandle(handle: QuickJSHandle): any {
    if (this._ctx.typeof(handle) === 'function') {
      const dup = this._registerHandle(handle.dup()) // do not touch this until you know what you are doing
      return (...args: unknown[]) => {
        const result = this._ctx.callFunction(dup, this._ctx.null, ...args.map((arg) => this.wrapNativeValue(arg)))
        return this.parseQJSHandle(this._registerHandle(this.unwrap(result)))
      }
    }

    if (this.classOf(handle) === 'Promise') {
      const promise = this._ctx.resolvePromise(handle)
      promise.then(() => this._ctx.runtime.executePendingJobs())
      this._ctx.runtime.executePendingJobs()
      return promise.then((wrapped) => {
        const qValue = this.unwrap(wrapped)
        const value = this.parseQJSHandle(qValue)
        qValue.dispose()
        return value
      })
    }

    return this._ctx.dump(handle)
  }

  wrapNativeFn(fn: (...args: any[]) => unknown, ctx: Record<PropertyKey, unknown> | null = null): QuickJSHandle {
    /**
     * @TODO
     * Fns are objects, check if it's possible to setProps on QJSHandles of Fns
     * */
    const qFn = this._registerHandle(
      this._ctx.newFunction(
        fn.name ?? `anonymous_fn_${this._anonymousFnIndex++}`,
        (
          arg0: QuickJSHandle,
          arg1: QuickJSHandle,
          arg2: QuickJSHandle,
          arg3: QuickJSHandle,
          arg4: QuickJSHandle,
          arg5: QuickJSHandle,
          arg6: QuickJSHandle,
          arg7: QuickJSHandle,
          arg8: QuickJSHandle,
          arg9: QuickJSHandle
        ) => {
          const args = [arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9]
          const argsNormalized = args.slice(0, args.findLastIndex((value) => value !== undefined) + 1)
          const argValues = argsNormalized.map((arg) => this.parseQJSHandle(arg))
          const result = fn.apply(ctx, argValues)
          return this.wrapNativeValue(result)
        }
      )
    )
    return qFn
  }

  wrapNativeArrayBuffer(value: ArrayBuffer): QuickJSHandle {
    return this._registerHandle(this._ctx.newArrayBuffer(value))
  }

  wrapNativePromise(value: Promise<unknown>): QuickJSHandle {
    const qPromise = this._ctx.newPromise()
    this._registerHandle(qPromise.handle)
    this._registerHandle(qPromise)
    value.then(
      (value) => qPromise.resolve(this.wrapNativeValue(value)),
      (err) => qPromise.reject(this.wrapNativeValue(err))
    )
    qPromise.settled.then(this._ctx.runtime.executePendingJobs)
    return qPromise.handle
  }

  wrapNativeArray<T>(arr: T[]): QuickJSHandle {
    const qArr = this._registerHandle(this._ctx.newArray())
    arr.forEach((value, index) => {
      this._ctx.setProp(qArr, String(index), this.wrapNativeValue(value, arr as unknown as Record<PropertyKey, unknown>))
    })
    return qArr
  }

  wrapNativeObject(obj: Record<PropertyKey, unknown>): QuickJSHandle {
    const qObj = this._registerHandle(this._ctx.newObject())
    const props = getProps(obj).filter((prop) => {
      return !this._skippableProps.includes(prop)
    })
    for (const prop of props) {
      const value = obj[prop]
      this._ctx.setProp(qObj, prop, this.wrapNativeValue(value, obj))
    }
    return qObj
  }
}
