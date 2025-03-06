import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { ErrorResponse } from '../../types/ErrorResponse.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('sync - node_modules', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	const runCode = async (code: string, options: object = {}): Promise<OkResponse | ErrorResponse> => {
		return await runtime.runSandboxed(async ({ evalCode }) => {
			return await evalCode(code)
		}, options)
	}

	it('can use node:path module', async () => {
		const code = `
			import { join } from 'node:path'
			export default join('example', 'folder')
		`

		const result = (await runCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('example/folder')
	})

	it('can use node:path module', async () => {
		const code = `
			import { resolve } from 'node:path'
			export default resolve('/example', 'folder', '../index')
		`

		const result = (await runCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('/example/index')
	})

	it('cannot use node:fs module by default', async () => {
		const code = `
			import { writeFileSync } from 'node:fs'

			writeFileSync('test.txt', 'text content')

			export default 'ok'
		`

		const result = (await runCode(code)) as ErrorResponse

		expect(result.ok).toBeFalse()
		expect(result.error).toMatchObject({
			name: 'Error',
			message: 'File access is disabled',
		})
	})

	it('can use node:fs module when allowFs is set to true', async () => {
		const code = `
			import { readFileSync, writeFileSync } from 'node:fs'

			writeFileSync('test.txt', 'text content')

			const content = readFileSync('test.txt', 'utf-8')

			export default content
		`

		const result = (await runCode(code, { allowFs: true })) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('text content')
	})

	it('can use a custom module', async () => {
		const code = `
			import { customModuleFunction } from 'custom'

			export default customModuleFunction()
		`

		const result = (await runCode(code, {
			allowFs: true,
			nodeModules: {
				custom: {
					'index.js': `export const customModuleFunction = () => 'Hello from custom module function'`,
				},
			},
		})) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('Hello from custom module function')
	})

	it('can use relative imports with js extension', async () => {
		const code = `
			import { relativeImportFunction } from './custom.js'

			export default relativeImportFunction()
		`

		const result = (await runCode(code, {
			allowFs: true,
			mountFs: {
				src: {
					'custom.js': `export const relativeImportFunction = () => 'Hello from relative import function'`,
				},
			},
		})) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('Hello from relative import function')
	})

	it('can use relative imports without js extension', async () => {
		const code = `
			import { relativeImportFunction } from './custom'

			export default relativeImportFunction()
		`

		const result = (await runCode(code, {
			allowFs: true,
			mountFs: {
				src: {
					'custom.js': `export const relativeImportFunction = () => 'Hello from relative import function'`,
				},
			},
		})) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('Hello from relative import function')
	})
})
