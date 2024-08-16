import type { IFs } from 'memfs'
import type { JSModuleLoaderAsync } from 'quickjs-emscripten-core'

import { join } from 'node:path'
import validate from 'validate-npm-package-name'

import type { RuntimeOptions } from './types/RuntimeOptions.js'

function tryLocal(inputName: string, fs: IFs) {
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

	if (value) {
		return { value }
	}

	return { error: new Error(`Module '${name}' not installed or available`) }
}

function tryBase64(pkgName: string) {
	if (pkgName.startsWith('data:text/javascript;base64,')) {
		try {
			const decoded = Buffer.from(pkgName.slice(28), 'base64').toString()
			console.log(decoded)
			return { value: decoded }
		} catch (err) {
			return { error: err as Error }
		}
	} 
	return { error: new Error(`Module '${pkgName}' not installed or unavailable`) }
}

async function defaultEsmShModuleFetcher(pkgName: string) {
	return (await fetch(`https://esm.sh/${pkgName}`)).text()
}

export const getModuleLoader = (fs: IFs, runtimeOptions: RuntimeOptions) => {
	const cachedModules: Map<string, string> = new Map()

	const moduleLoader: JSModuleLoaderAsync = async (inputName, _context) => {
		const localResolve = tryLocal(inputName, fs)
		if (!localResolve.error) return localResolve

		const pkgName = inputName.replace(/^\/node_modules\//g, '')

		const base64Resolve = tryBase64(pkgName)
		if (!base64Resolve.error) return base64Resolve

		if (runtimeOptions.fetchModules && validate(pkgName)) {
			if (!cachedModules.has(pkgName)) {
				const fetcher = runtimeOptions.moduleFetcher ?? defaultEsmShModuleFetcher
				let pkgContent = await fetcher(pkgName)
				cachedModules.set(pkgName, pkgContent)
			}
			
			return cachedModules.get(pkgName) as string
		}

		return { error: new Error(`Module '${inputName}' not installed or available`) }
	}

	return moduleLoader
}
