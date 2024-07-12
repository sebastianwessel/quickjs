import type { IFs } from 'memfs'
import type { Arena } from '../sync/index.js'
import type { SandboxEvalCode } from './SandboxEvalCode.js'
import type { SandboxValidateCode } from './SandboxValidateCode.js'

export type SandboxFunction<T> = (sandbox: {
	arena: Arena
	evalCode: SandboxEvalCode
	validateCode: SandboxValidateCode
	mountedFs: IFs
}) => Promise<T>
