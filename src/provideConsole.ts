import type { Arena } from './sync/index.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

/**
 * Provide all Node.js console methods
 */
export const provideConsole = (arena: Arena, options: RuntimeOptions) => {
	const logger = {
		log: (...params) => console.log(...params),
		error: (...params) => console.error(...params),
		warn: (...params) => console.warn(...params),
		info: (...params) => console.info(...params),
		debug: (...params) => console.debug(...params),
		trace: (...params) => console.trace(...params),
		assert: (...params) => console.assert(...params),
		count: (...params) => console.count(...params),
		countReset: (...params) => console.countReset(...params),
		dir: (...params) => console.dir(...params),
		dirxml: (...params) => console.dirxml(...params),
		group: (...params) => console.group(...params),
		groupCollapsed: (...params) => console.groupCollapsed(...params),
		groupEnd: () => console.groupEnd(),
		table: (...params) => console.table(...params),
		time: (...params) => console.time(...params),
		timeEnd: (...params) => console.timeEnd(...params),
		timeLog: (...params) => console.timeLog(...params),
		clear: () => {
			throw new Error('console.clear is disabled for security reasons by default')
		},
		...options.console,
	}

	arena.expose({
		console: {
			log: logger.log,
			error: logger.error,
			warn: logger.warn,
			info: logger.info,
			debug: logger.debug,
			trace: logger.trace,
			assert: logger.assert,
			count: logger.count,
			countReset: logger.countReset,
			dir: logger.dir,
			dirxml: logger.dirxml,
			group: logger.group,
			groupCollapsed: logger.groupCollapsed,
			groupEnd: logger.groupEnd,
			table: logger.table,
			time: logger.time,
			timeEnd: logger.timeEnd,
			timeLog: logger.timeLog,
			clear: logger.clear,
		},
	})
}
