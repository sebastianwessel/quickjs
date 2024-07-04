import type { Arena } from './sync/index.js'

import type { RuntimeOptions } from './types/RuntimeOptions.js'

export const provideEnv = (arena: Arena, options: RuntimeOptions) => {
	const timeouts = new Map<number, ReturnType<typeof setTimeout>>()
	let timeoutCounter = 0

	const intervals = new Map<number, ReturnType<typeof setTimeout>>()
	let intervalCounter = 0

	arena.expose({
		env: options.env ?? {},
		process: {
			env: options.env ?? { NODE_DEBUG: 'true' },
			cwd: () => '/',
		},
		setTimeout: (fn: () => void, time: number) => {
			timeoutCounter++
			timeouts.set(timeoutCounter, setTimeout(fn, time))
			return timeoutCounter
		},
		clearTimeout: (id: number) => {
			const timeout = timeouts.get(id)
			if (timeout) {
				clearTimeout(timeout)
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
			}
		},
	})
}
