export type ErrorResponse = {
	ok: false
	error: {
		name: string
		message: string
		stack?: string
	}
	isSyntaxError?: boolean
}
