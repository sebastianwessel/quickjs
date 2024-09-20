import type { SandboxOptions } from './SandboxOptions.js'
import type { VMContext } from './VMContext.js'

export type CodeFunctionInput = {
	ctx: VMContext
	sandboxOptions: SandboxOptions
	transpileFile: (input: string) => string
}
