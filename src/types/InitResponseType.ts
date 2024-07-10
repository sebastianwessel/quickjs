import type { IFs } from 'memfs'
import type { ContextEvalOptions } from 'quickjs-emscripten-core'
import type { Arena } from '../sync/index.js'
import type { ErrorResponse } from './ErrorResponse.js'
import type { OkResponse } from './OkResponse.js'
import type { OkResponseCheck } from './OkResponseCheck.js'

export type InitResponseType = {
	vm: Arena
	dispose: () => void
	evalCode: (
		code: string,
		filename?: string,
		options?: Omit<ContextEvalOptions, 'type'> & { executionTimeout?: number },
	) => Promise<OkResponse | ErrorResponse>
	validateCode: (
		code: string,
		filename?: string,
		options?: Omit<ContextEvalOptions, 'type'> & { executionTimeout?: number },
	) => Promise<OkResponseCheck | ErrorResponse>
	mountedFs?: IFs
}
