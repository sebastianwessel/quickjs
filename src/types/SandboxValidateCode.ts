import type { ContextEvalOptions } from 'quickjs-emscripten-core'
import type { ErrorResponse } from './ErrorResponse.js'
import type { OkResponseCheck } from './OkResponseCheck.js'
import type { Prettify } from './Prettify.js'

export type SandboxValidateCode = (
	code: string,
	filename?: string,
	options?: Prettify<
		Omit<ContextEvalOptions, 'type'> & {
			executionTimeout?: number
			maxStackSize?: number
			memoryLimit?: number
		}
	>,
) => Promise<OkResponseCheck | ErrorResponse>
