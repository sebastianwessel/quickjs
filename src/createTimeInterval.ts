/**
 * Utilizes the standard setInterval to work properly with javascript `using` statement.
 * Because of this, the interval gets automatically cleared on dispose.
 */
export const createTimeInterval = (...params: Parameters<typeof setInterval>) => {
	const id = setInterval(...params)
	return {
		id,
		[Symbol.dispose]: () => {
			clearInterval(id)
		},
	}
}
