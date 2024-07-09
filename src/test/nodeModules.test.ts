import { describe, expect, it } from 'bun:test'
import { quickJS } from '../quickJS.js'
import type { ErrorResponse } from '../types/ErrorResponse.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('node_modules', () => {
	it('can use node:path module', async () => {
		const { createRuntime } = await quickJS()

		const { evalCode } = await createRuntime()

		const code = `
    import { join } from 'node:path'
    export default join('example','folder')
    `

		const result = (await evalCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('example/folder')
	})

	it('can use node:path module', async () => {
		const { createRuntime } = await quickJS()

		const { evalCode } = await createRuntime()

		const code = `
    import { resolve } from 'node:path'
    export default resolve('/example','folder','../index')
    `

		const result = (await evalCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('/example/index')
	})

	it('can not use node:fs module per default', async () => {
		const { createRuntime } = await quickJS()

		const { evalCode } = await createRuntime()

		const code = `
    import { writeFileSync } from 'node:fs'

    writeFileSync('test.txt', 'text content')

    export default 'ok'
    `

		const result = (await evalCode(code)) as ErrorResponse

		expect(result.ok).toBeFalse()
		expect(result.error).toMatchObject({
			name: 'Error',
			message: 'File access is disabled',
		})
	})

	it('can use node:fs module when allowFs is set to true', async () => {
		const { createRuntime } = await quickJS()

		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
    import { readFileSync, writeFileSync } from 'node:fs'

    writeFileSync('test.txt', 'text content')

    const content = readFileSync('test.txt')

    export default content
    `

		const result = (await evalCode(code)) as OkResponse

		console.log(result)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('text content')
	})

	it('can use a custom module', async () => {
		const { createRuntime } = await quickJS()

		const { evalCode } = await createRuntime({
			allowFs: true,
			nodeModules: {
				custom: {
					'index.js': `export const customModuleFunction = ()=>'Hello from custom module function'`,
				},
			},
		})

		const code = `
    import { customModuleFunction } from 'custom'

    export default customModuleFunction()
    `

		const result = (await evalCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('Hello from custom module function')
	})

	it('can use relative imports with js extension', async () => {
		const { createRuntime } = await quickJS()

		const { evalCode } = await createRuntime({
			allowFs: true,
			mountFs: {
				src: {
					'custom.js': `export const relativeImportFunction = ()=>'Hello from relative import function'`,
				},
			},
		})

		const code = `
    import { relativeImportFunction } from './custom.js'

    export default relativeImportFunction()
    `

		const result = (await evalCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('Hello from relative import function')
	})

	it('can use relative imports without js extension', async () => {
		const { createRuntime } = await quickJS()

		const { evalCode } = await createRuntime({
			allowFs: true,
			mountFs: {
				src: {
					'custom.js': `export const relativeImportFunction = ()=>'Hello from relative import function'`,
				},
			},
		})

		const code = `
    import { relativeImportFunction } from './custom'

    export default relativeImportFunction()
    `

		const result = (await evalCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('Hello from relative import function')
	})
})
