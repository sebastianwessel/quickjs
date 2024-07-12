import type { Arena } from './sync/index.js'

import type { RuntimeOptions } from './types/RuntimeOptions.js'

export const provideEnv = (arena: Arena, options: RuntimeOptions) => {
	let dangerousSync: Record<string, unknown> = {}
	if (options.dangerousSync) {
		dangerousSync = arena.sync(options.dangerousSync)
	}

	arena.expose({
		__dangerousSync: dangerousSync,
		env: options.env ?? {},
		process: {
			env: options.env ?? { NODE_DEBUG: 'true' },
			cwd: () => '/',
		},
	})
}
