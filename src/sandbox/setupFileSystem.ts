import { type IFs, Volume } from 'memfs'
import { createVirtualFileSystem } from '../createVirtualFileSystem.js'
import type { SandboxBaseOptions } from '../types/SandboxOptions.js'

export const setupFileSystem = (runtimeOptions: SandboxBaseOptions): IFs => {
	if (runtimeOptions.mountFs && runtimeOptions.mountFs instanceof Volume) {
		return runtimeOptions.mountFs
	}
	return createVirtualFileSystem(runtimeOptions).fs
}
