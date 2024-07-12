import type { CodeFunctionInput } from '../types/CodeFunctionInput.js'
import type { OkResponseCheck } from '../types/OkResponseCheck.js'
import type { SandboxValidateCode } from '../types/SandboxValidateCode.js'
import { handleEvalError } from './handleEvalError.js'

export const createValidateCodeFunction = (input: CodeFunctionInput): SandboxValidateCode => {
	const { arena } = input
	return async (code, filename = '/src/index.js', evalOptions?) => {
		try {
			arena.evalCode(code, filename, {
				strict: true,
				strip: true,
				backtraceBarrier: true,
				...evalOptions,
				type: 'module',
				compileOnly: true,
			})
			return { ok: true } as OkResponseCheck
		} catch (err) {
			return handleEvalError(err)
		}
	}
}
