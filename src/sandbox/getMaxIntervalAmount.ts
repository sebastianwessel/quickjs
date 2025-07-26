import type { SandboxBaseOptions } from '../index.js'

/**
 * Determines the maximum allowed amount of concurrent intervals.
 *
 * @param runtimeOptions - The sandbox options containing `maxIntervalCount`.
 * @returns The configured `maxIntervalCount` or `10` if none is set.
 */
export const getMaxIntervalAmount = (runtimeOptions: SandboxBaseOptions) => {
	if (!runtimeOptions.maxIntervalCount || runtimeOptions.maxIntervalCount <= 0) {
		return 10
	}
	return runtimeOptions.maxIntervalCount
}
