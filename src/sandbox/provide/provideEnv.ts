import type { Scope } from 'quickjs-emscripten-core'
import type { RuntimeOptions } from '../../types/RuntimeOptions.js'
import type { VMContext } from '../../types/VMContext.js'
import { expose } from '../expose/expose.js'

export const provideEnv = (ctx: VMContext, scope: Scope, options: RuntimeOptions) => {
	expose(ctx, scope, {
		env: options.env ?? {},
		process: {
			env: options.env ?? { NODE_DEBUG: 'true' },
			cwd: () => '/',
		},
	})
}
