import { type QuickJSAsyncContext, type QuickJSContext, type QuickJSHandle, Scope } from 'quickjs-emscripten-core'

type TimeoutEntry = {
	id: ReturnType<typeof setTimeout>
	callback: QuickJSHandle
	args: QuickJSHandle[]
}

type IntervalEntry = {
	id: ReturnType<typeof setInterval>
	callback: QuickJSHandle
	args: QuickJSHandle[]
	cancelled: boolean
	running: boolean
}

const disposeHandles = (handles: QuickJSHandle[]) => {
	for (const handle of handles) {
		handle.dispose()
	}
}

export const provideTimingFunctions = (
	ctx: QuickJSContext | QuickJSAsyncContext,
	max: {
		maxTimeoutCount: number
		maxIntervalCount: number
	},
) => {
	const scope = new Scope()

	const timeouts = new Map<number, TimeoutEntry>()
	let timeoutCounter = 0

	const immediates = new Map<number, TimeoutEntry>()
	let immediateCounter = 0

	const intervals = new Map<number, IntervalEntry>()
	let intervalCounter = 0

	const disposeTimeoutEntry = (entry: TimeoutEntry) => {
		clearTimeout(entry.id)
		entry.callback.dispose()
		disposeHandles(entry.args)
	}

	const disposeIntervalEntry = (entry: IntervalEntry) => {
		clearInterval(entry.id)
		entry.callback.dispose()
		disposeHandles(entry.args)
	}

	const callTimerCallback = (callback: QuickJSHandle, args: QuickJSHandle[]) => {
		const result = ctx.callFunction(callback, ctx.undefined, ...args)
		if (result.error) {
			result.error.dispose()
			return
		}
		result.value.dispose()
	}

	const copyTimerArgs = (args: QuickJSHandle[]) => args.map(arg => arg.dup())

	const _setTimeout = ctx.newFunction('setTimeout', (vmFnHandle, timeoutHandle, ...argHandles) => {
		const currentCounter = timeoutCounter++
		if (timeouts.size + 1 > max.maxTimeoutCount) {
			vmFnHandle.dispose()
			timeoutHandle?.dispose()
			disposeHandles(argHandles)
			throw new Error(
				`Client tries to use setTimeout, which exceeds the limit of max ${max.maxTimeoutCount} concurrent running timeout functions`,
			)
		}

		const vmFnHandleCopy = vmFnHandle.dup()
		const timeout = timeoutHandle ? ctx.dump(timeoutHandle) : undefined
		const args = copyTimerArgs(argHandles)
		vmFnHandle.dispose()
		timeoutHandle?.dispose()
		disposeHandles(argHandles)

		const timeoutID = setTimeout(() => {
			const entry = timeouts.get(currentCounter)
			if (!entry) {
				return
			}
			timeouts.delete(currentCounter)
			try {
				callTimerCallback(entry.callback, entry.args)
			} finally {
				disposeTimeoutEntry(entry)
			}
		}, timeout)

		timeouts.set(currentCounter, { id: timeoutID, callback: vmFnHandleCopy, args })

		return ctx.newNumber(currentCounter)
	})

	scope.manage(_setTimeout)
	ctx.setProp(ctx.global, 'setTimeout', _setTimeout)

	const _clearTimeout = ctx.newFunction('clearTimeout', timeoutHandle => {
		const id: number = ctx.dump(timeoutHandle)
		timeoutHandle.dispose()

		const t = timeouts.get(id)
		if (t) {
			timeouts.delete(id)
			disposeTimeoutEntry(t)
		}
	})

	scope.manage(_clearTimeout)
	ctx.setProp(ctx.global, 'clearTimeout', _clearTimeout)

	const _setImmediate = ctx.newFunction('setImmediate', (vmFnHandle, ...argHandles) => {
		const currentCounter = immediateCounter++
		if (immediates.size + 1 > max.maxTimeoutCount) {
			vmFnHandle.dispose()
			disposeHandles(argHandles)
			throw new Error(
				`Client tries to use setImmediate, which exceeds the limit of max ${max.maxTimeoutCount} concurrent running timeout functions`,
			)
		}

		const vmFnHandleCopy = vmFnHandle.dup()
		const args = copyTimerArgs(argHandles)
		vmFnHandle.dispose()
		disposeHandles(argHandles)

		const timeoutID = setTimeout(() => {
			const entry = immediates.get(currentCounter)
			if (!entry) {
				return
			}
			immediates.delete(currentCounter)
			try {
				callTimerCallback(entry.callback, entry.args)
			} finally {
				disposeTimeoutEntry(entry)
			}
		}, 0)

		immediates.set(currentCounter, { id: timeoutID, callback: vmFnHandleCopy, args })

		return ctx.newNumber(currentCounter)
	})

	scope.manage(_setImmediate)
	ctx.setProp(ctx.global, 'setImmediate', _setImmediate)

	const _clearImmediate = ctx.newFunction('clearImmediate', idHandle => {
		const id: number = ctx.dump(idHandle)
		idHandle.dispose()

		const t = immediates.get(id)
		if (t) {
			immediates.delete(id)
			disposeTimeoutEntry(t)
		}
	})

	scope.manage(_clearImmediate)
	ctx.setProp(ctx.global, 'clearImmediate', _clearImmediate)

	const _setInterval = ctx.newFunction('setInterval', (vmFnHandle, intervalHandle, ...argHandles) => {
		const currentCounter = intervalCounter++
		if (intervals.size + 1 > max.maxIntervalCount) {
			vmFnHandle.dispose()
			intervalHandle?.dispose()
			disposeHandles(argHandles)
			throw new Error(
				`Client tries to use setInterval, which exceeds the limit of max ${max.maxIntervalCount} concurrent running interval functions`,
			)
		}
		const vmFnHandleCopy = vmFnHandle.dup()
		const args = copyTimerArgs(argHandles)
		const interval = ctx.dump(intervalHandle)
		vmFnHandle.dispose()
		intervalHandle.dispose()
		disposeHandles(argHandles)

		const intervalID = setInterval(() => {
			const entry = intervals.get(currentCounter)
			if (!entry) {
				return
			}
			entry.running = true
			try {
				callTimerCallback(entry.callback, entry.args)
			} finally {
				entry.running = false
				if (entry.cancelled) {
					disposeIntervalEntry(entry)
				}
			}
		}, interval)

		intervals.set(currentCounter, {
			id: intervalID,
			callback: vmFnHandleCopy,
			args,
			cancelled: false,
			running: false,
		})

		return ctx.newNumber(currentCounter)
	})

	scope.manage(_setInterval)
	ctx.setProp(ctx.global, 'setInterval', _setInterval)

	const _clearInterval = ctx.newFunction('clearInterval', intervalHandle => {
		const id: number = ctx.dump(intervalHandle)
		intervalHandle.dispose()

		const t = intervals.get(id)
		if (t) {
			intervals.delete(id)
			if (t.running) {
				clearInterval(t.id)
				t.cancelled = true
				return
			}
			disposeIntervalEntry(t)
		}
	})

	scope.manage(_clearInterval)
	ctx.setProp(ctx.global, 'clearInterval', _clearInterval)

	const dispose = () => {
		for (const [_key, value] of timeouts) {
			disposeTimeoutEntry(value)
		}
		timeouts.clear()
		timeoutCounter = 0

		for (const [_key, value] of immediates) {
			disposeTimeoutEntry(value)
		}
		immediates.clear()
		immediateCounter = 0

		for (const [_key, value] of intervals) {
			disposeIntervalEntry(value)
		}
		intervals.clear()
		intervalCounter = 0

		scope.dispose()
	}

	return { dispose }
}
