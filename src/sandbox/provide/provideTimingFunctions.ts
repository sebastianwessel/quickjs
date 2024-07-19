import type { Scope } from 'quickjs-emscripten-core'
import type { VMContext } from '../../types/VMContext.js'
import { expose } from '../expose/expose.js'

export const provideTimingFunctions = (ctx: VMContext, scope: Scope) => {
	const timeouts = new Map<number, ReturnType<typeof setTimeout>>()
	let timeoutCounter = 0

	const intervals = new Map<number, ReturnType<typeof setTimeout>>()
	let intervalCounter = 0

	expose(ctx, scope, {
		setTimeout: (fn: () => void, time: number) => {
			timeoutCounter++
			timeouts.set(timeoutCounter, setTimeout(fn, time))
			return timeoutCounter
		},
		clearTimeout: (id: number) => {
			const timeout = timeouts.get(id)
			if (timeout) {
				clearTimeout(timeout)
				timeouts.delete(id)
			}
		},
		setInterval: (fn: () => void, time: number) => {
			intervalCounter++

			const interval = setInterval(fn, time)
			intervals.set(intervalCounter, interval)
			return intervalCounter
		},
		clearInterval: (id: number) => {
			const interval = intervals.get(id)
			if (interval) {
				clearInterval(interval)
				intervals.delete(id)
			}
		},
	})
	const dispose = () => {
		for (const [_key, value] of timeouts) {
			clearTimeout(value)
		}
		timeouts.clear()

		for (const [_key, value] of intervals) {
			clearInterval(value)
		}
		intervals.clear()
	}

	return { dispose }
}
