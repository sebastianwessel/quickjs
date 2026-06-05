import type { ErrorResponse } from '../types/ErrorResponse.js'

export const normalizeInterruptedExecution = (err: unknown, timeoutMs: number): unknown => {
	if (!(timeoutMs > 0 && err instanceof Error && err.message === 'interrupted')) {
		return err
	}

	const timeoutError = new Error('The script execution has exceeded the maximum allowed time limit.')
	timeoutError.name = 'ExecutionTimeout'
	timeoutError.stack = err.stack
	return timeoutError
}

export const handleEvalError = (err: unknown): ErrorResponse => {
	return err instanceof Error
		? {
				ok: false,
				error: {
					name: err.name,
					message: err.message,
					stack: err.stack,
				},
				isSyntaxError: err.name === 'SyntaxError',
			}
		: {
				ok: false,
				error: {
					name: 'UnknownError',
					message: typeof err === 'string' ? err : 'An unknown error occurred.',
					stack: '',
				},
				isSyntaxError: false,
			}
}
