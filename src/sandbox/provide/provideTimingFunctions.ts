import { type QuickJSAsyncContext, type QuickJSContext, Scope } from 'quickjs-emscripten-core'

export const provideTimingFunctions = (
	ctx: QuickJSContext | QuickJSAsyncContext,
	max: {
		maxTimeoutCount: number
		maxIntervalCount: number
	},
) => {
	const scope = new Scope()

	const timeouts = new Map<number, ReturnType<typeof setTimeout>>()
	let timeoutCounter = 0

	const intervals = new Map<number, ReturnType<typeof setTimeout>>()
	let intervalCounter = 0

	const _setTimeout = ctx.newFunction('setTimeout', (vmFnHandle, timeoutHandle) => {
		timeoutCounter++
		if (timeouts.size + 1 > max.maxTimeoutCount) {
			throw new Error(
				`Client tries to use setTimeout, which exceeds the limit of max ${max.maxTimeoutCount} concurrent running timeout functions`,
			)
		}

		const vmFnHandleCopy = vmFnHandle.dup()
		scope.manage(vmFnHandleCopy)
		const timeout = ctx.dump(timeoutHandle)

		const timeoutID = setTimeout(() => {
			const t = timeouts.get(timeoutCounter)
			if (t) {
				clearTimeout(t)
				timeouts.delete(timeoutCounter)
			}
			ctx.callFunction(vmFnHandleCopy, ctx.undefined)
		}, timeout)

		timeouts.set(timeoutCounter, timeoutID)

		return ctx.newNumber(timeoutCounter)
	})

	scope.manage(_setTimeout)
	ctx.setProp(ctx.global, 'setTimeout', _setTimeout)

	const _clearTimeout = ctx.newFunction('clearTimeout', timeoutHandle => {
		const id: number = ctx.dump(timeoutHandle)
		timeoutHandle.dispose

		const t = timeouts.get(id)
		if (t) {
			clearTimeout(t)
			timeouts.delete(id)
		}
	})

	scope.manage(_clearTimeout)
	ctx.setProp(ctx.global, 'clearTimeout', _clearTimeout)

	const _setInterval = ctx.newFunction('setInterval', (vmFnHandle, intervalHandle) => {
		intervalCounter++
		if (intervals.size + 1 > max.maxIntervalCount) {
			throw new Error(
				`Client tries to use setInterval, which exceeds the limit of max ${max.maxIntervalCount} concurrent running interval functions`,
			)
		}
		const vmFnHandleCopy = vmFnHandle.dup()
		scope.manage(vmFnHandleCopy)
		const interval = ctx.dump(intervalHandle)

		const intervalID = setInterval(() => {
			ctx.callFunction(vmFnHandleCopy, ctx.undefined)
		}, interval)

		intervals.set(intervalCounter, intervalID)

		return ctx.newNumber(intervalCounter)
	})

	scope.manage(_setInterval)
	ctx.setProp(ctx.global, 'setInterval', _setInterval)

	const _clearInterval = ctx.newFunction('clearInterval', intervalHandle => {
		const id: number = ctx.dump(intervalHandle)
		intervalHandle.dispose

		const t = intervals.get(id)
		if (t) {
			clearInterval(t)
			intervals.delete(id)
		}
	})

	scope.manage(_clearInterval)
	ctx.setProp(ctx.global, 'clearInterval', _clearInterval)

	const dispose = () => {
		for (const [_key, value] of timeouts) {
			clearTimeout(value)
		}
		timeouts.clear()
		timeoutCounter = 0

		for (const [_key, value] of intervals) {
			clearInterval(value)
		}
		intervals.clear()
		intervalCounter = 0

		scope.dispose()
	}

	return { dispose }
}
