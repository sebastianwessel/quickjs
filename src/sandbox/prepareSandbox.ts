import type { IFs } from 'memfs'
import type { Scope } from 'quickjs-emscripten-core'
import type { SandboxOptions } from '../types/SandboxOptions.js'
import type { VMContext } from '../types/VMContext.js'
import { provideConsole } from './provide/provideConsole.js'
import { provideEnv } from './provide/provideEnv.js'
import { provideFs } from './provide/provideFs.js'
import { provideHttp } from './provide/provideHttp.js'

export const prepareSandbox = (ctx: VMContext, scope: Scope, sandboxOptions: SandboxOptions, fs: IFs) => {
	provideFs(ctx, scope, sandboxOptions, fs)
	provideConsole(ctx, scope, sandboxOptions)
	provideEnv(ctx, scope, sandboxOptions)
	provideHttp(ctx, scope, sandboxOptions, { fs: sandboxOptions.allowFs ? fs : undefined })
}
