import fs from 'node:fs'
import path from 'node:path'

interface ExportsField {
	import?: string | ExportsField
	require?: string | ExportsField
	[key: string]: any
}

interface PackageJson {
	name: string
	main?: string
	module?: string
	exports?: string | ExportsField
	[key: string]: any
}

function resolveExportsField(exportsField: ExportsField, subPath: string, isEsm: boolean): string | undefined {
	if (typeof exportsField === 'string') {
		return subPath ? undefined : exportsField
	}
	if (isEsm && exportsField.import) {
		return resolveExportsField(exportsField.import as ExportsField, subPath, isEsm)
	}
	if (!isEsm && exportsField.require) {
		return resolveExportsField(exportsField.require as ExportsField, subPath, isEsm)
	}
	if (exportsField[subPath]) {
		return isEsm ? exportsField[subPath].import : exportsField[subPath].require
	}
	return undefined
}

function getEntryPointPath(importPath: string): string | undefined {
	const [packageName, subPath] = importPath.split(/\/(.+)/)

	const packageJsonPath = path.resolve('node_modules', packageName, 'package.json')
	if (!fs.existsSync(packageJsonPath)) {
		throw new Error(`Cannot find package.json for package: ${packageName}`)
	}

	const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8')
	const packageJson: PackageJson = JSON.parse(packageJsonContent)

	let entryPoint: string | undefined
	if (packageJson.exports) {
		if (typeof packageJson.exports === 'string') {
			entryPoint = subPath ? undefined : packageJson.exports
		} else if (typeof packageJson.exports === 'object') {
			// Try to resolve ESM entry point first
			entryPoint = resolveExportsField(packageJson.exports as ExportsField, subPath, true)
			if (!entryPoint) {
				// Fallback to CommonJS entry point
				entryPoint = resolveExportsField(packageJson.exports as ExportsField, subPath, false)
			}
		}
	}
	if (!entryPoint && packageJson.module) {
		entryPoint = subPath ? undefined : packageJson.module
	}
	if (!entryPoint && packageJson.main) {
		entryPoint = subPath ? undefined : packageJson.main
	}
	if (!entryPoint) {
		return undefined
	}

	const finalPath = subPath ? path.join(path.dirname(entryPoint), subPath) : entryPoint
	return path.resolve('/', 'node_modules', packageJson.name, finalPath)
}

// Example usage:
console.log(getEntryPointPath('my-package')) // should return /node_modules/my-package/dist/index.mjs
console.log(getEntryPointPath('my-package/feature')) // should return /node_modules/my-package/dist/feature.mjs
