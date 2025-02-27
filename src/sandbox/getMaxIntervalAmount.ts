import type { SandboxBaseOptions } from '../index.js'

export const getMaxIntervalAmount = (runtimeOptions: SandboxBaseOptions) => {
	if (!runtimeOptions.maxIntervalCount || runtimeOptions.maxIntervalCount <= 0) {
		return 10
	}
	return runtimeOptions.maxIntervalCount
}
