import type { IFs } from 'memfs'
import type { QuickJSAsyncContext, QuickJSContext } from 'quickjs-emscripten-core'
import type { SandboxEvalCode } from './SandboxEvalCode.js'
import type { SandboxValidateCode } from './SandboxValidateCode.js'

export type SandboxFunction<T> = (sandbox: {
	ctx: QuickJSContext
	evalCode: SandboxEvalCode
	validateCode: SandboxValidateCode
	mountedFs: IFs
}) => Promise<T>

export type AsyncSandboxFunction<T> = (sandbox: {
	ctx: QuickJSAsyncContext
	evalCode: SandboxEvalCode
	validateCode: SandboxValidateCode
	mountedFs: IFs
}) => Promise<T>
