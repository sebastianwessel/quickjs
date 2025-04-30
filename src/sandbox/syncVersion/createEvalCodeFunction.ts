import type { Scope } from 'quickjs-emscripten-core'
import { createTimeInterval } from '../../createTimeInterval.js'
import type { CodeFunctionInput } from '../../types/CodeFunctionInput.js'
import type { OkResponse } from '../../types/OkResponse.js'
import type { SandboxEvalCode } from '../../types/SandboxEvalCode.js'
import { getMaxIntervalAmount } from '../getMaxIntervalAmount.js'
import { getMaxTimeoutAmount } from '../getMaxTimeoutAmount.js'
import { handleEvalError } from '../handleEvalError.js'
import { handleToNative } from '../handleToNative/handleToNative.js'
import { provideTimingFunctions } from '../provide/provideTimingFunctions.js'

export const createEvalCodeFunction = (input: CodeFunctionInput, scope: Scope): SandboxEvalCode => {
	const { ctx, sandboxOptions, transpileFile } = input
	return async (code, filename = '/src/index.js', evalOptions?) => {
		const eventLoopinterval = createTimeInterval(() => ctx.runtime.executePendingJobs(), 0)

		let timeoutId: ReturnType<typeof setTimeout> | undefined

		const { dispose: disposeTimer } = provideTimingFunctions(ctx, {
			maxTimeoutCount: getMaxTimeoutAmount(sandboxOptions),
			maxIntervalCount: getMaxIntervalAmount(sandboxOptions),
		})

		const disposeStep = () => {
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
			eventLoopinterval?.clear()
			disposeTimer()
		}

		try {
			const jsCode = transpileFile(code)
			const evalResult = ctx.evalCode(jsCode, filename, {
				strict: true,
				strip: false,
				backtraceBarrier: true,
				...evalOptions,
				type: 'module',
			})

			const handle = scope.manage(ctx.unwrapResult(evalResult))

			const native = handleToNative(ctx, handle, scope)
			const result = await Promise.race([
				(async () => {
					const res = await native
					return res.default
				})(),
				new Promise((_resolve, reject) => {
					if (sandboxOptions.executionTimeout) {
						timeoutId = setTimeout(() => {
							const err = new Error('The script execution has exceeded the maximum allowed time limit.')
							err.name = 'ExecutionTimeout'
							reject(err)
						}, sandboxOptions.executionTimeout)
					}
				}),
			])

			return { ok: true, data: result } as OkResponse
		} catch (err) {
			return handleEvalError(err)
		} finally {
			disposeStep()
		}
	}
}
