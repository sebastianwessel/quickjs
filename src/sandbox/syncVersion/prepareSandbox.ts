import type { IFs } from 'memfs'
import type { QuickJSContext, Scope } from 'quickjs-emscripten-core'
import type { SandboxBaseOptions } from '../../types/SandboxOptions.js'
import { provideEnv } from '../provide/provideEnv.js'
import { provideFs } from '../provide/provideFs.js'
import { provideHttp } from '../provide/provideHttp.js'
import { provideConsole } from './../provide/provideConsole.js'

export const prepareSandbox = (ctx: QuickJSContext, scope: Scope, sandboxOptions: SandboxBaseOptions, fs: IFs) => {
	provideFs(ctx, scope, sandboxOptions, fs)
	provideConsole(ctx, scope, sandboxOptions)
	provideEnv(ctx, scope, sandboxOptions)
	provideHttp(ctx, scope, sandboxOptions, { fs: sandboxOptions.allowFs ? fs : undefined })
}
