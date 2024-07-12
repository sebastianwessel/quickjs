import type { Arena } from '../sync/index.js'
import type { SandboxOptions } from './SandboxOptions.js'

export type CodeFunctionInput = {
	arena: Arena
	sandboxOptions: SandboxOptions
	transpileFile: (input: string) => string
}
