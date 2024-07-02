export type ErrorResponse = {
	ok: false
	error: Error
	stack?: string
	isSyntaxError?: boolean
}
