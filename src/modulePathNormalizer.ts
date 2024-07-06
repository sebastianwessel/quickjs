import { join, resolve } from 'node:path'
import type { JSModuleNormalizer } from 'quickjs-emscripten-core'

export const modulePathNormalizer: JSModuleNormalizer = (baseName: string, requestedName: string) => {
	// relative import
	if (requestedName.startsWith('.')) {
		const parts = baseName.split('/')
		parts.pop()

		return resolve(`/${parts.join('/')}`, requestedName)
	}

	// module import
	const moduleName = requestedName.replace('node:', '')
	return join('/node_modules', moduleName, 'index.js')
}
