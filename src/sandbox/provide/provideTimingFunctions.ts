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

        const immediates = new Map<number, ReturnType<typeof setTimeout>>()
        let immediateCounter = 0

	const intervals = new Map<number, ReturnType<typeof setTimeout>>()
	let intervalCounter = 0

	const _setTimeout = ctx.newFunction('setTimeout', (vmFnHandle, timeoutHandle) => {
		const currentCounter = timeoutCounter++
		if (timeouts.size + 1 > max.maxTimeoutCount) {
			throw new Error(
				`Client tries to use setTimeout, which exceeds the limit of max ${max.maxTimeoutCount} concurrent running timeout functions`,
			)
		}

		const vmFnHandleCopy = vmFnHandle.dup()
		scope.manage(vmFnHandleCopy)
		const timeout = timeoutHandle ? ctx.dump(timeoutHandle) : undefined

		const timeoutID = setTimeout(() => {
			const t = timeouts.get(currentCounter)
			if (t) {
				clearTimeout(t)
				timeouts.delete(currentCounter)
			}
			ctx.callFunction(vmFnHandleCopy, ctx.undefined)
		}, timeout)

		timeouts.set(currentCounter, timeoutID)

		return ctx.newNumber(currentCounter)
	})

	scope.manage(_setTimeout)
	ctx.setProp(ctx.global, 'setTimeout', _setTimeout)

	const _clearTimeout = ctx.newFunction('clearTimeout', timeoutHandle => {
		const id: number = ctx.dump(timeoutHandle)
		timeoutHandle.dispose()

		const t = timeouts.get(id)
		if (t) {
			clearTimeout(t)
			timeouts.delete(id)
		}
	})

	scope.manage(_clearTimeout)
        ctx.setProp(ctx.global, 'clearTimeout', _clearTimeout)

        const _setImmediate = ctx.newFunction('setImmediate', vmFnHandle => {
                const currentCounter = immediateCounter++
                if (timeouts.size + 1 > max.maxTimeoutCount) {
                        throw new Error(
                                `Client tries to use setImmediate, which exceeds the limit of max ${max.maxTimeoutCount} concurrent running timeout functions`,
                        )
                }

                const vmFnHandleCopy = vmFnHandle.dup()
                scope.manage(vmFnHandleCopy)

                const timeoutID = setTimeout(() => {
                        const t = immediates.get(currentCounter)
                        if (t) {
                                clearTimeout(t)
                                immediates.delete(currentCounter)
                        }
                        ctx.callFunction(vmFnHandleCopy, ctx.undefined)
                }, 0)

                immediates.set(currentCounter, timeoutID)

                return ctx.newNumber(currentCounter)
        })

        scope.manage(_setImmediate)
        ctx.setProp(ctx.global, 'setImmediate', _setImmediate)

        const _clearImmediate = ctx.newFunction('clearImmediate', idHandle => {
                const id: number = ctx.dump(idHandle)
                idHandle.dispose()

                const t = immediates.get(id)
                if (t) {
                        clearTimeout(t)
                        immediates.delete(id)
                }
        })

        scope.manage(_clearImmediate)
        ctx.setProp(ctx.global, 'clearImmediate', _clearImmediate)

	const _setInterval = ctx.newFunction('setInterval', (vmFnHandle, intervalHandle) => {
		const currentCounter = intervalCounter++
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

		intervals.set(currentCounter, intervalID)

		return ctx.newNumber(currentCounter)
	})

	scope.manage(_setInterval)
	ctx.setProp(ctx.global, 'setInterval', _setInterval)

	const _clearInterval = ctx.newFunction('clearInterval', intervalHandle => {
		const id: number = ctx.dump(intervalHandle)
		intervalHandle.dispose()

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

                for (const [_key, value] of immediates) {
                        clearTimeout(value)
                }
                immediates.clear()
                immediateCounter = 0

                for (const [_key, value] of intervals) {
                        clearInterval(value)
                }
                intervals.clear()
		intervalCounter = 0

		scope.dispose()
	}

	return { dispose }
}
