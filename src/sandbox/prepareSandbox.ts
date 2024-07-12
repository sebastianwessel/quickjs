import type { IFs } from 'memfs'
import { provideConsole } from '../provideConsole'
import { provideEnv } from '../provideEnv.js'
import { provideFs } from '../provideFs.js'
import { provideHttp } from '../provideHttp.js'
import type { Arena } from '../sync/index.js'
import type { SandboxOptions } from '../types/SandboxOptions.js'

export const prepareSandbox = (arena: Arena, sandboxOptions: SandboxOptions, fs: IFs) => {
	provideFs(arena, sandboxOptions, fs)
	provideConsole(arena, sandboxOptions)
	provideEnv(arena, sandboxOptions)
	provideHttp(arena, sandboxOptions, { fs: sandboxOptions.allowFs ? fs : undefined })
}
