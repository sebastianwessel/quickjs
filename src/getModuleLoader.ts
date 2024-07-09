import type { IFs } from 'memfs'
import type { JSModuleLoader } from 'quickjs-emscripten-core'

import { join } from 'node:path'

import type { RuntimeOptions } from './types/RuntimeOptions.js'

export const getModuleLoader = (fs: IFs, _runtimeOptions: RuntimeOptions) => {
	const moduleLoader: JSModuleLoader = (inputName, _context) => {
		let name = inputName

		// if it does not exist
		if (!fs.existsSync(name)) {
			// try to add the .js extension
			if (fs.existsSync(`${name}.js`)) {
				name = `${name}.js`
			} else {
				return { error: new Error(`Module '${inputName}' not installed or available`) }
			}
		}

		// if it is a folder, we need to use the index.js file
		if (fs.lstatSync(name).isDirectory()) {
			name = join(name, 'index.js')
			if (!fs.existsSync(name)) {
				return { error: new Error(`Module '${inputName}' not installed or available`) }
			}
		}

		// workaround: as we can not provide the real import.meta.url functionality, we replace it dynamically with the current value string
		const value = fs.readFileSync(name)?.toString().replaceAll('import.meta.url', `'file://${name}'`)

		if (!value) {
			return { error: new Error(`Module '${name}' not installed or available`) }
		}
		return { value }
	}

	return moduleLoader
}
