import type { ContextEvalOptions } from 'quickjs-emscripten-core'
import type { ErrorResponse } from './ErrorResponse.js'
import type { OkResponse } from './OkResponse.js'
import type { Prettify } from './Prettify.js'

export type SandboxEvalCode = (
	code: string,
	filename?: string,
	options?: Prettify<
		Omit<ContextEvalOptions, 'type'> & {
			executionTimeout?: number
			maxStackSize?: number
			memoryLimit?: number
			/**
			 * Allow unsafe serialization from guest to host
			 */
			allowInteraction?: boolean
		}
	>,
) => Promise<OkResponse | ErrorResponse>
