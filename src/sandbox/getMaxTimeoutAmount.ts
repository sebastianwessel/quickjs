import type { SandboxOptions } from '../index.js'

export const getMaxTimeoutAmount = (runtimeOptions: SandboxOptions) => {
	if (!runtimeOptions.maxTimeoutCount || runtimeOptions.maxTimeoutCount <= 0) {
		return 10
	}
	return runtimeOptions.maxTimeoutCount
}
