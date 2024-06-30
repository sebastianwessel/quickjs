import type { Arena } from './sync/index.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

/**
 * Provide console.log, console.warn and console.error
 */
export const provideConsole = (arena: Arena, options: RuntimeOptions) => {
	const logger = {
		log: console.log,
		error: console.error,
		warn: console.warn,
		...options.console,
	}

	arena.expose({
		console: {
			log: logger.log,
			error: logger.error,
			warn: logger.warn,
		},
	})
}
