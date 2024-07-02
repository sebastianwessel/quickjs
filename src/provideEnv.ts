import type { Arena } from './sync/index.js'

import type { RuntimeOptions } from './types/RuntimeOptions.js'

export const provideEnv = (arena: Arena, options: RuntimeOptions) => {
	arena.expose({
		env: options.env,
		process: {
			env: options.env,
			cwd: () => '/',
		},
	})
}
