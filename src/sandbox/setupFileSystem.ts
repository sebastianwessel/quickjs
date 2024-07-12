import { type IFs, Volume } from 'memfs'
import { createVirtualFileSystem } from '../createVirtualFileSystem.js'
import type { SandboxOptions } from '../types/SandboxOptions.js'

export const setupFileSystem = (runtimeOptions: SandboxOptions): IFs => {
	if (runtimeOptions.mountFs && runtimeOptions.mountFs instanceof Volume) {
		return runtimeOptions.mountFs
	}
	return createVirtualFileSystem(runtimeOptions).fs
}
