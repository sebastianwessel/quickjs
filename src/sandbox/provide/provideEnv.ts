import type { QuickJSAsyncContext, QuickJSContext, Scope } from 'quickjs-emscripten-core'
import type { RuntimeOptions } from '../../types/RuntimeOptions.js'
import { expose } from '../expose/expose.js'

export const provideEnv = (ctx: QuickJSContext | QuickJSAsyncContext, scope: Scope, options: RuntimeOptions) => {
	expose(ctx, scope, {
		env: options.env ?? {},
		process: {
			env: options.env ?? { NODE_DEBUG: 'true' },
			cwd: () => '/',
		},
	})
}
