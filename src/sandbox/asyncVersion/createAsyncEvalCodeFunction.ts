import type { Scope } from 'quickjs-emscripten-core'
import { createTimeInterval } from '../../createTimeInterval.js'
import type { CodeFunctionAsyncInput } from '../../types/CodeFunctionInput.js'
import type { OkResponse } from '../../types/OkResponse.js'
import type { SandboxEvalCode } from '../../types/SandboxEvalCode.js'
import { rejectAndFlushPendingHostPromises } from '../expose/pendingHostPromises.js'
import { getMaxIntervalAmount } from '../getMaxIntervalAmount.js'
import { getMaxTimeoutAmount } from '../getMaxTimeoutAmount.js'
import { handleEvalError } from '../handleEvalError.js'
import { handleToNative } from '../handleToNative/handleToNative.js'
import { provideTimingFunctions } from '../provide/provideTimingFunctions.js'

export const createAsyncEvalCodeFunction = (input: CodeFunctionAsyncInput, scope: Scope): SandboxEvalCode => {
	const { ctx, sandboxOptions, transpileFile } = input
	return async (code, filename = '/src/index.js', evalOptions?) => {
		const eventLoopinterval = createTimeInterval(() => ctx.runtime.executePendingJobs(), 0)
		const timeoutMs = sandboxOptions.executionTimeout ?? 0

		let timeoutId: ReturnType<typeof setTimeout> | undefined
		let nativePromise: Promise<unknown> | undefined
		let timedOut = false

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
			const evalResult = await ctx.evalCodeAsync(jsCode, filename, {
				strict: true,
				strip: false,
				backtraceBarrier: true,
				...evalOptions,
				type: 'module',
			})

			const handle = scope.manage(ctx.unwrapResult(evalResult))

			const native = handleToNative(ctx, handle, scope)
			nativePromise = (async () => {
				const res = await native
				return res.default
			})()

			const result = await Promise.race([
				nativePromise,
				new Promise((_resolve, reject) => {
					if (timeoutMs > 0) {
						timeoutId = setTimeout(() => {
							timedOut = true
							const err = new Error('The script execution has exceeded the maximum allowed time limit.')
							err.name = 'ExecutionTimeout'
							reject(err)
						}, timeoutMs)
					}
				}),
			])

			return { ok: true, data: result } as OkResponse
		} catch (err) {
			return handleEvalError(err)
		} finally {
			if (timedOut && nativePromise) {
				// Reject unresolved host-injected promises to avoid leaving QuickJS promises
				// pending while disposing the runtime after timeout.
				await rejectAndFlushPendingHostPromises(ctx)

				// Force-fast interrupt handling and give pending guest jobs a short window to settle.
				ctx.runtime.setInterruptHandler(() => true)
				const cleanupWait = Math.min(Math.max(timeoutMs, 50), 1000)
				await Promise.race([
					nativePromise.catch(() => undefined),
					new Promise(resolve => setTimeout(resolve, cleanupWait)),
				])
			}
			disposeStep()
		}
	}
}
