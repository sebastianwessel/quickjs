import type { QuickJSHandle } from 'quickjs-emscripten-core'
import type { VMContext } from '../types/VMContext.js'

export const call = (
	ctx: VMContext,
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
		const e = new Error((error as Error).message ?? 'Function call failed in serialisation')
		e.cause = error
		throw e
	}
}
