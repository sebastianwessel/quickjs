import type { IFs } from 'memfs'
import type { Scope } from 'quickjs-emscripten-core'
import type { CodeFunctionInput } from '../types/CodeFunctionInput.js'
import type { SandboxFunction } from '../types/SandboxFunction.js'
import type { SandboxOptions } from '../types/SandboxOptions.js'
import type { VMContext } from '../types/VMContext.js'
import { createEvalCodeFunction } from './createEvalCodeFunction.js'
import { createValidateCodeFunction } from './createValidateCodeFunction.js'

export const executeSandboxFunction = async <T>(input: {
	ctx: VMContext
	fs: IFs
	scope: Scope
	sandboxOptions: SandboxOptions
	sandboxedFunction: SandboxFunction<T>
	transpileFile: (input: string) => string
}) => {
	const { ctx, sandboxOptions, sandboxedFunction, fs, transpileFile } = input
	const opt: CodeFunctionInput = { ctx, sandboxOptions, transpileFile }
	const evalCode = createEvalCodeFunction(opt, input.scope)
	const validateCode = createValidateCodeFunction(opt)
	return await sandboxedFunction({ ctx, evalCode, validateCode, mountedFs: fs })
}
