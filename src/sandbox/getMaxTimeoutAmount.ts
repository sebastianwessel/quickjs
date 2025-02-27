import type { SandboxBaseOptions } from '../index.js'

export const getMaxTimeoutAmount = (runtimeOptions: SandboxBaseOptions) => {
	if (!runtimeOptions.maxTimeoutCount || runtimeOptions.maxTimeoutCount <= 0) {
		return 10
	}
	return runtimeOptions.maxTimeoutCount
}
