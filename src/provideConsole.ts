import type { Arena } from './sync/index.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

/**
 * Provide all Node.js console methods
 */
export const provideConsole = (arena: Arena, options: RuntimeOptions) => {
	const logger = {
		log: console.log,
		error: console.error,
		warn: console.warn,
		info: console.info,
		debug: console.debug,
		trace: console.trace,
		assert: console.assert,
		count: console.count,
		countReset: console.countReset,
		dir: console.dir,
		dirxml: console.dirxml,
		group: console.group,
		groupCollapsed: console.groupCollapsed,
		groupEnd: console.groupEnd,
		table: console.table,
		time: console.time,
		timeEnd: console.timeEnd,
		timeLog: console.timeLog,
		clear: console.clear,
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
