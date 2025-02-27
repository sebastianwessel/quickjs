import type { QuickJSAsyncContext, QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

export const call = (
	ctx: QuickJSContext | QuickJSAsyncContext,
	fileName: string,
	code: string,
	that: QuickJSHandle | undefined,
	...args: QuickJSHandle[]
) => {
	const fnHandle = ctx.unwrapResult(ctx.evalCode(code, fileName))
	try {
		const callHandle = ctx.unwrapResult(ctx.callFunction(fnHandle, that || ctx.undefined, ...args))
		fnHandle.dispose()
		return callHandle
	} catch (error) {
		console.error(error)
		const e = new Error((error as Error).message ?? 'Function call failed in serialization')
		e.cause = error
		throw e
	}
}
