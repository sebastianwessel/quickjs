import type { IFs } from 'memfs'
import type { SandboxEvalCode } from './SandboxEvalCode.js'
import type { SandboxValidateCode } from './SandboxValidateCode.js'
import type { VMContext } from './VMContext.js'

export type SandboxFunction<T> = (sandbox: {
	ctx: VMContext
	evalCode: SandboxEvalCode
	validateCode: SandboxValidateCode
	mountedFs: IFs
}) => Promise<T>
