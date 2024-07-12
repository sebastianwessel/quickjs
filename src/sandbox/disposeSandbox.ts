import type { DisposeFunction } from '../types/DisposeFunction.js'

export const disposeSandbox = (finalDisposals: { name: string; dispose: DisposeFunction }[]) => {
	let err: unknown

	for (const disposal of finalDisposals) {
		try {
			disposal.dispose()
		} catch (error) {
			err = error
			console.error(`Failed to dispose ${disposal.name}`)
		}
	}

	if (err) {
		throw err
	}
}
