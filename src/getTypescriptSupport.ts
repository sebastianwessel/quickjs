import { join } from 'node:path'
import type { IFs, NestedDirectoryJSON } from 'memfs'
import type { default as TS } from 'typescript'

export type TranspileNestedJsonOptions = {
	fileExtensions?: string[]
}

export type TranspileVirtualFsOptions = {
	fileExtensions?: string[]
	startPath?: string
}

/**
 * Add support for handling typescript files and code.
 * Requires the optional dependency 'typescript'.
 */
export const getTypescriptSupport = async (enabled = false, options?: TS.CompilerOptions) => {
	if (!enabled) {
		return {
			transpileFile: (
				value: string,
				_compilerOptions?: TS.CompilerOptions,
				_fileName?: string,
				_diagnostics?: TS.Diagnostic[],
				_moduleName?: string,
			) => value,
			transpileNestedDirectoryJSON: (
				mountFsJson: NestedDirectoryJSON,
				_option?: TranspileNestedJsonOptions,
			): NestedDirectoryJSON => mountFsJson,
			transpileVirtualFs: (fs: IFs, _options?: TranspileVirtualFsOptions): IFs => {
				return fs
			},
		}
	}

	let ts: typeof TS
	try {
		ts = await import('typescript')
	} catch (error) {
		throw new Error('Package "typescript" is missing')
	}

	const compilerOptions: TS.CompilerOptions = {
		module: 99, // ESNext
		target: 99, // ES2023
		//lib: ['ESNext'],
		allowJs: true,
		// moduleResolution: 100,
		skipLibCheck: true,
		esModuleInterop: true,
		strict: false,
		allowSyntheticDefaultImports: true,
		...options,
	}

	/**
	 * Transpile a single File
	 *
	 * @param params source typescript code
	 * @returns javascript code
	 */
	const transpileFile: typeof ts.transpile = (
		input: string,
		cpOptions = compilerOptions,
		fileName?: string,
		diagnostics?: TS.Diagnostic[],
		moduleName?: string,
	) => ts.transpile(input, cpOptions, fileName, diagnostics, moduleName)

	/**
	 * Iterates through the given JSON - NestedDirectoryJSON for defining the virtual file system.
	 * Replace every typescript file with the transpiled javascript version and renames the file to *.js
	 *
	 * @param mountFsJson
	 * @param fileExtensions
	 * @returns
	 */
	const transpileNestedDirectoryJSON = (
		mountFsJson: NestedDirectoryJSON,
		option?: TranspileNestedJsonOptions,
	): NestedDirectoryJSON => {
		const opt = {
			fileExtensions: ['ts'],
			...option,
		}

		const transformJson = (
			obj: NestedDirectoryJSON,
			transformer: (key: string, value: any) => [string, any],
		): NestedDirectoryJSON => {
			if (typeof obj === 'object' && obj !== null) {
				const newObj: any = Array.isArray(obj) ? [] : {}
				for (const key in obj) {
					if (obj[key]) {
						const [newKey, newValue] = transformer(key, obj[key])
						newObj[newKey] = transformJson(newValue, transformer)
					}
				}
				return newObj
			}
			return obj
		}

		const transpileTypescript = (key: string, value: string | Buffer): [string, any] => {
			if (!opt.fileExtensions.includes(key)) {
				return [key, value]
			}
			const newFileName = key.replace('.ts', '.js')
			const tsSource = typeof value === 'string' ? value : value.toString()
			const jsSource = transpileFile(tsSource, compilerOptions)
			return [newFileName, jsSource]
		}

		return transformJson(mountFsJson, transpileTypescript)
	}

	const transpileVirtualFs = (fs: IFs, options?: TranspileVirtualFsOptions) => {
		const opt = {
			startPath: '/src',
			...options,
		}

		const transformFileSystem = (startPath: string): void => {
			if (!fs.existsSync(startPath)) {
				throw new Error(`Directory not found: ${startPath}`)
			}

			const files = fs.readdirSync(startPath)
			for (const file of files) {
				const filePath = join(startPath, file as string)
				const stat = fs.lstatSync(filePath)

				if (stat.isDirectory()) {
					// ignore node_modules
					if ((file as string) !== 'node_modules') {
						transformFileSystem(filePath)
					}
				} else if (stat.isFile()) {
					const newFilePath = join(startPath, (file as string).replace('.ts', '.js'))
					const content = fs.readFileSync(filePath, 'utf8')
					const tsSource = typeof content === 'string' ? content : content.toString()
					const jsSource = transpileFile(tsSource, compilerOptions, newFilePath)
					fs.renameSync(filePath, newFilePath)
					fs.writeFileSync(newFilePath, jsSource)
				}
			}
		}

		transformFileSystem(opt.startPath)

		return fs
	}

	return { transpileFile, transpileNestedDirectoryJSON, transpileVirtualFs }
}
