import type { SandboxOptions } from '../index.js'

export const getMaxIntervalAmount = (runtimeOptions: SandboxOptions) => {
	if (!runtimeOptions.maxIntervalCount || runtimeOptions.maxIntervalCount <= 0) {
		return 10
	}
	return runtimeOptions.maxIntervalCount
}
