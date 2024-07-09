export default `
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

export const builtinModules = ['node:assert', 'node:fs', 'node:module', 'node:path', 'node:util']

export const createRequire = parentFilename => {
  const parts = baseName.split('/')
	parts.pop()
	const parent = parts.join('/')

	return fileName => {
    console.log('custom require', fileName)
		const filePath = resolve('/',parent, fileName)
		return readFileSync(filePath)
	}
}

export const isBuiltin = moduleName =>
	builtinModules.some(module => module.replace('node:', '') === moduleName.replace('node:', ''))

export const register = () => {
	console.error('node:module method register is not available in sandbox')
	throw new Error('node:module method register is not available in sandbox')
}

export const syncBuiltinESMExports = () => {
	console.error('node:module method syncBuiltinESMExports is not available in sandbox')
	throw new Error('node:module method syncBuiltinESMExports is not available in sandbox')
}

export default { builtinModules, createRequire, isBuiltin, register, syncBuiltinESMExports }
`
