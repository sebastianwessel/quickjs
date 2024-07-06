import { describe, expect, it } from 'bun:test'
import { quickJS } from '../quickJS.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('node:fs - directory', () => {
	const testDirPath = '/testDir'
	const tempDirPrefix = '/tmpDir'

	it('can create and read a directory synchronously', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { mkdirSync, readdirSync } from 'node:fs'

			mkdirSync('${testDirPath}')
			const files = readdirSync('/')

			export default files.includes('testDir')
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can create and remove a directory synchronously', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { mkdirSync, rmdirSync, readdirSync } from 'node:fs'

			mkdirSync('${testDirPath}')
			rmdirSync('${testDirPath}')
			const files = readdirSync('/')

			export default !files.includes('testDir')
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can create a temporary directory synchronously', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { mkdtempSync } from 'node:fs'

			const tempDir = mkdtempSync('${tempDirPrefix}')
			const isTempDir = tempDir.startsWith('${tempDirPrefix}')

			export default isTempDir
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can create and read a directory asynchronously', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { mkdir, readdir } from 'node:fs/promises'

			await mkdir('${testDirPath}')
			const files = await readdir('/')

			export default files.includes('testDir')
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can create and remove a directory asynchronously', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { mkdir, rmdir, readdir } from 'node:fs/promises'

			await mkdir('${testDirPath}')
			await rmdir('${testDirPath}')
			const files = await readdir('/')

			export default !files.includes('testDir')
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can create a temporary directory asynchronously', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { mkdtemp } from 'node:fs/promises'

			const tempDir = await mkdtemp('${tempDirPrefix}')
			const isTempDir = tempDir.startsWith('${tempDirPrefix}')

			export default isTempDir
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})
})
