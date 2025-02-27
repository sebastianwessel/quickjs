import type { QuickJSAsyncContext, QuickJSContext } from 'quickjs-emscripten-core'
import type { SandboxAsyncOptions, SandboxOptions } from './SandboxOptions.js'

export type CodeFunctionInput = {
	ctx: QuickJSContext
	sandboxOptions: SandboxOptions
	transpileFile: (input: string) => string
}

export type CodeFunctionAsyncInput = {
	ctx: QuickJSAsyncContext
	sandboxOptions: SandboxAsyncOptions
	transpileFile: (input: string) => string
}
