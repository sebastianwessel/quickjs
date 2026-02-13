import type { IFs } from 'memfs'
import { createVirtualFileSystem } from '../createVirtualFileSystem.js'
import type { SandboxBaseOptions } from '../types/SandboxOptions.js'

const isMountedFs = (input: unknown): input is IFs =>
	typeof input === 'object' &&
	input !== null &&
	'readFileSync' in input &&
	typeof input.readFileSync === 'function' &&
	'existsSync' in input &&
	typeof input.existsSync === 'function'

export const setupFileSystem = (runtimeOptions: SandboxBaseOptions): IFs => {
	if (runtimeOptions.mountFs && isMountedFs(runtimeOptions.mountFs)) {
		return runtimeOptions.mountFs
	}
	return createVirtualFileSystem(runtimeOptions).fs
}
