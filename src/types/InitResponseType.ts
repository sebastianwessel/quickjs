import type { IFs } from 'memfs'
import type { ContextEvalOptions } from 'quickjs-emscripten-core'
import type { Arena } from '../sync/index.js'
import type { ErrorResponse } from './ErrorResponse.js'
import type { OkResponse } from './OkResponse.js'

export type InitResponseType = {
	vm: Arena
	dispose: () => void
	evalCode: (
		code: string,
		filename?: string,
		options?: number | ContextEvalOptions,
	) => Promise<OkResponse | ErrorResponse>
	mountedFs?: IFs
}
