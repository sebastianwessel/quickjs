import { shouldInterruptAfterDeadline } from 'quickjs-emscripten-core'
import { createTimeInterval } from '../createTimeInterval.js'
import { provideTimingFunctions } from '../provideTimingFunctions.js'
import type { CodeFunctionInput } from '../types/CodeFunctionInput.js'
import type { OkResponse } from '../types/OkResponse.js'
import type { SandboxEvalCode } from '../types/SandboxEvalCode.js'
import { getMaxTimeout } from './getMaxTimeout.js'
import { handleEvalError } from './handleEvalError.js'

export const createEvalCodeFunction = (input: CodeFunctionInput): SandboxEvalCode => {
	const { arena, sandboxOptions, transpileFile } = input
	return async (code, filename = '/src/index.js', evalOptions?) => {
		const maxTimeout = getMaxTimeout(sandboxOptions, evalOptions)

		if (maxTimeout) {
			arena.context.runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + maxTimeout))
		}

		const eventLoopinterval = createTimeInterval(() => arena.context.runtime.executePendingJobs(), 0)

		const { dispose: disposeTimer } = provideTimingFunctions(arena)

		const disposeStep = () => {
			eventLoopinterval?.clear()
			disposeTimer()
		}

		try {
			const jsCode = transpileFile(code)
			const evalResult = arena.evalCode(jsCode, filename, {
				strict: true,
				strip: true,
				backtraceBarrier: true,
				...evalOptions,
				type: 'module',
			})

			const result = await Promise.race([
				(async () => {
					const res = await evalResult
					return JSON.parse(JSON.stringify(res))
				})(),
				new Promise((_resolve, reject) => {
					if (maxTimeout) {
						setTimeout(() => {
							const err = new Error('The script execution has exceeded the maximum allowed time limit.')
							err.name = 'ExecutionTimeout'
							reject(err)
						}, maxTimeout)
					}
				}),
			])

			return { ok: true, data: result.default } as OkResponse
		} catch (err) {
			return handleEvalError(err)
		} finally {
			disposeStep()
		}
	}
}
