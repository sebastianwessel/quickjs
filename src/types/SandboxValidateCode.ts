import type { ContextEvalOptions } from 'quickjs-emscripten-core'
import type { ErrorResponse } from './ErrorResponse.js'
import type { OkResponseCheck } from './OkResponseCheck.js'

export type SandboxValidateCode = (
	code: string,
	filename?: string,
	options?: Omit<ContextEvalOptions, 'type'> & { executionTimeout?: number },
) => Promise<OkResponseCheck | ErrorResponse>
