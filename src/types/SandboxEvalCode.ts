import type { ContextEvalOptions } from 'quickjs-emscripten-core'
import type { ErrorResponse } from './ErrorResponse.js'
import type { OkResponse } from './OkResponse.js'

export type SandboxEvalCode = (
	code: string,
	filename?: string,
	options?: Omit<ContextEvalOptions, 'type'> & { executionTimeout?: number },
) => Promise<OkResponse | ErrorResponse>
