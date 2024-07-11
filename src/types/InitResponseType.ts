import type { IFs } from 'memfs'
import type { ContextEvalOptions } from 'quickjs-emscripten-core'
import type { Arena } from '../sync/index.js'
import type { ErrorResponse } from './ErrorResponse.js'
import type { OkResponse } from './OkResponse.js'
import type { OkResponseCheck } from './OkResponseCheck.js'

export type InitResponseType = {
	/**
	 * The QuickJS Arena runtime
	 */
	vm: Arena
	/**
	 * Dispose the sandbox.
	 * It should not be needed to call this, as this is done automatically
	 */
	dispose: () => void
	/**
	 * Execute code once and cleanup after execution.
	 *
	 * The result of the code execution must be exported with export default.
	 * If the code is async, it needs to be awaited on export.
	 *
	 * @example
	 * ```js
	 * const result = await evalCode('export default await asyncFunction()')
	 * ```
	 */
	evalCode: (
		code: string,
		filename?: string,
		options?: Omit<ContextEvalOptions, 'type'> & { executionTimeout?: number },
	) => Promise<OkResponse | ErrorResponse>
	/**
	 * Compile code only, but does not execute the code.
	 *
	 * @example
	 * ```js
	 * const result = await validateCode('export default await asyncFunction()')
	 * ```
	 */
	validateCode: (
		code: string,
		filename?: string,
		options?: Omit<ContextEvalOptions, 'type'> & { executionTimeout?: number },
	) => Promise<OkResponseCheck | ErrorResponse>
	/**
	 * the virtual filesystem
	 *
	 */
	mountedFs: IFs
}
