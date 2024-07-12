import type { IFs } from 'memfs'
import type { Arena } from '../sync/index.js'
import type { CodeFunctionInput } from '../types/CodeFunctionInput.js'
import type { DisposeFunction } from '../types/DisposeFunction.js'
import type { SandboxFunction } from '../types/SandboxFunction.js'
import type { SandboxOptions } from '../types/SandboxOptions.js'
import { createEvalCodeFunction } from './createEvalCodeFunction.js'
import { createValidateCodeFunction } from './createValidateCodeFunction.js'
import { disposeSandbox } from './disposeSandbox.js'

export const executeSandboxFunction = async <T>(input: {
	arena: Arena
	fs: IFs
	sandboxOptions: SandboxOptions
	sandboxedFunction: SandboxFunction<T>
	transpileFile: (input: string) => string
	finalDisposals: { name: string; dispose: DisposeFunction }[]
}) => {
	const { arena, sandboxOptions, sandboxedFunction, fs, transpileFile, finalDisposals } = input
	const opt: CodeFunctionInput = { arena, sandboxOptions, transpileFile }
	const evalCode = createEvalCodeFunction(opt)
	const validateCode = createValidateCodeFunction(opt)

	return await sandboxedFunction({ arena, evalCode, validateCode, mountedFs: fs }).finally(() => {
		// Ensure that the sandbox gets destroyed at the end - even if something goes wrong
		try {
			disposeSandbox(finalDisposals)
		} catch (error) {
			console.error('Failed to dispose', error)
		}
	})
}
