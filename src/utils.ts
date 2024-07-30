import { QuickJSContext, QuickJSHandle } from "quickjs-emscripten-core"

/**
 * Doesn't read symbols. On purpose.
 */
export function getProps(obj: Record<PropertyKey, unknown>): string[] {
  const proto = Object.getPrototypeOf(obj)
  const own = Object.getOwnPropertyNames(obj)
  return proto ? [...own, ...getProps(proto)] : own
}

export function isObject(obj: unknown): obj is Record<PropertyKey, unknown> {
  return Boolean(obj && (typeof obj === 'function' || typeof obj === 'object'))
}

export function parseEnvNumber(num: unknown, defaultValue?: number): number {
  const n = Number(num)
  if (Number.isNaN(n)) {
    if (arguments.length === 2) return defaultValue as number
    throw new Error('Incorrect type of env variable value')
  }
  return n
}

export function exposeToCtxGlobal(ctx: QuickJSContext, name: string, handle: QuickJSHandle): void {
  handle.consume((handle) => ctx.setProp(ctx.global, name, handle))
}