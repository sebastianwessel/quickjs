import { join, resolve } from 'node:path'
import variant from '@jitl/quickjs-ng-wasmfile-release-asyncify'
import type { QuickJSAsyncContext } from 'quickjs-emscripten-core'
import { getAsyncModuleLoader, loadAsyncQuickJs, type SandboxAsyncOptions } from '../../src/index.js'

const { runSandboxed } = await loadAsyncQuickJs(variant)

const modulePathNormalizer = async (baseName: string, requestedName: string) => {
	// import from esm.sh
	if (requestedName.startsWith('esm.sh')) {
		return `https://${requestedName}`
	}

	// import from esm.sh
	if (requestedName.startsWith('https://esm.sh')) {
		return requestedName
	}

	// import within an esm.sh import
	if (requestedName.startsWith('/')) {
		return `https://esm.sh${requestedName}`
	}

	// relative import
	if (requestedName.startsWith('.')) {
		// relative import from esm.sh loaded module
		if (baseName.startsWith('https://esm.sh')) {
			return new URL(requestedName, baseName).toString()
		}

		// relative import from local import
		const parts = baseName.split('/')
		parts.pop()

		return resolve(`/${parts.join('/')}`, requestedName)
	}

	// unify module import name
	const moduleName = requestedName.replace('node:', '')

	return join('/node_modules', moduleName)
}

const getModuleLoader = (fs, runtimeOptions) => {
	const defaultLoader = getAsyncModuleLoader(fs, runtimeOptions)

	const loader = async (moduleName: string, context: QuickJSAsyncContext) => {
		console.log('fetching module', moduleName)

		if (!moduleName.startsWith('https://esm.sh')) {
			return defaultLoader(moduleName, context)
		}

		const response = await fetch(moduleName)
		if (!response.ok) {
			throw new Error(`Failed to load module ${moduleName}`)
		}
		const content = await response.text()
		return content
	}

	return loader
}

const options: SandboxAsyncOptions = {
	modulePathNormalizer,
	getModuleLoader,
}

const code = `
import * as React from 'esm.sh/react@15'
import * as ReactDOMServer from 'esm.sh/react-dom@15/server'
const e = React.createElement
export default ReactDOMServer.renderToStaticMarkup(
  e('div', null, e('strong', null, 'Hello world!'))
)
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result)
