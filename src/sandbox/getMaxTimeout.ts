import type { SandboxBaseOptions } from '../types/SandboxOptions.js'

export const getMaxTimeout = (
	runtimeOptions: SandboxBaseOptions,
	evalOptions?: { executionTimeout?: number },
): number | undefined => {
	let maxTimeout: number | undefined

	if (runtimeOptions.executionTimeout || evalOptions?.executionTimeout) {
		maxTimeout = runtimeOptions.executionTimeout || evalOptions?.executionTimeout

		if (runtimeOptions.executionTimeout && evalOptions?.executionTimeout) {
			maxTimeout = Math.min(runtimeOptions.executionTimeout, evalOptions.executionTimeout)
		}
	}

	return maxTimeout ? maxTimeout * 1_000 : undefined
}
