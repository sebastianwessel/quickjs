import { describe, expect, it } from 'bun:test'
import { quickJS } from '../quickJS.js'
import type { ErrorResponse } from '../types/ErrorResponse.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('node_modules', () => {
	it('can use node:path module', async () => {
		const { initRuntime } = await quickJS()

		const { evalCode } = await initRuntime()

		const code = `
    import { join } from 'node:path'
    export default join('example','folder')
    `

		const result = (await evalCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('example/folder')
	})

	it('can use node:path module', async () => {
		const { initRuntime } = await quickJS()

		const { evalCode } = await initRuntime()

		const code = `
    import { resolve } from 'node:path'
    export default resolve('/example','folder','../index')
    `

		const result = (await evalCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('/example/index')
	})

	it('can not use node:fs module per default', async () => {
		const { initRuntime } = await quickJS()

		const { evalCode } = await initRuntime()

		const code = `
    import { readFileSync } from 'node:fs'
    export default 'ok'
    `

		const result = (await evalCode(code)) as ErrorResponse

		expect(result.ok).toBeFalse()
		expect(result.error).toStrictEqual({
			name: 'Error',
			message: "Module '/node_modules/fs/index.js' not installed or available",
			stack: undefined,
		})
	})

	it('can use node:fs module when allowFs is set to true', async () => {
		const { initRuntime } = await quickJS()

		const { evalCode } = await initRuntime({ allowFs: true })

		const code = `
    import { readFileSync, writeFileSync } from 'node:fs'

    writeFileSync('test.txt', 'text content')

    const content = readFileSync('test.txt')

    export default content
    `

		const result = (await evalCode(code)) as OkResponse

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('text content')
	})
})
