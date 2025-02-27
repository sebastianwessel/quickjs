import type { IFs } from 'memfs'
import type { QuickJSAsyncContext, Scope } from 'quickjs-emscripten-core'
import type { CodeFunctionAsyncInput } from '../../types/CodeFunctionInput.js'
import type { AsyncSandboxFunction } from '../../types/SandboxFunction.js'
import type { SandboxAsyncOptions } from '../../types/SandboxOptions.js'
import { createAsyncEvalCodeFunction } from './createAsyncEvalCodeFunction.js'
import { createAsyncValidateCodeFunction } from './createAsyncValidateCodeFunction.js'

export const executeAsyncSandboxFunction = async <T>(input: {
	ctx: QuickJSAsyncContext
	fs: IFs
	scope: Scope
	sandboxOptions: SandboxAsyncOptions
	sandboxedFunction: AsyncSandboxFunction<T>
	transpileFile: (input: string) => string
}) => {
	const { ctx, sandboxOptions, sandboxedFunction, fs, transpileFile } = input
	const opt: CodeFunctionAsyncInput = { ctx, sandboxOptions, transpileFile }
	const evalCode = createAsyncEvalCodeFunction(opt, input.scope)
	const validateCode = createAsyncValidateCodeFunction(opt)
	return await sandboxedFunction({ ctx, evalCode, validateCode, mountedFs: fs })
}
