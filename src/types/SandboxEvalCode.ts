import type { ContextEvalOptions } from 'quickjs-emscripten-core'
import type { ErrorResponse } from './ErrorResponse.js'
import type { OkResponse } from './OkResponse.js'
import type { Prettify } from './Prettify.js'

export type SandboxEvalCode<T = unknown> = (
	code: string,
	filename?: string,
	options?: Prettify<Omit<ContextEvalOptions, 'type'>>,
) => Promise<OkResponse<T> | ErrorResponse>
