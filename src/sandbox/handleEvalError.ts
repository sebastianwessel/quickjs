import type { ErrorResponse } from '../types/ErrorResponse.js'

export const handleEvalError = (err: unknown): ErrorResponse => {
	const e = err as Error

	return {
		ok: false,
		error: {
			name: e.name,
			message: e.message,
			stack: e.stack,
		},
		isSyntaxError: e.name === 'SyntaxError',
	}
}
