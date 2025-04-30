import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('sync - node:fs - directory', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>
	const testDirPath = '/testDir'
	const tempDirPrefix = '/tmpDir'

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	const runCode = async (code: string) => {
		return await runtime.runSandboxed(
			async ({ evalCode }) => {
				return await evalCode(code)
			},
			{ allowFs: true },
		)
	}

	it('can create and read a directory synchronously', async () => {
		const code = `
			import { mkdirSync, readdirSync } from 'node:fs'

			mkdirSync('${testDirPath}')
			const files = readdirSync('/')

			export default files.includes('testDir')
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can create and remove a directory synchronously', async () => {
		const code = `
			import { mkdirSync, rmdirSync, readdirSync } from 'node:fs'

			mkdirSync('${testDirPath}')
			rmdirSync('${testDirPath}')
			const files = readdirSync('/')

			export default !files.includes('testDir')
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can create a temporary directory synchronously', async () => {
		const code = `
			import { mkdtempSync } from 'node:fs'

			const tempDir = mkdtempSync('${tempDirPrefix}')
			const isTempDir = tempDir.startsWith('${tempDirPrefix}')

			export default isTempDir
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can create and read a directory asynchronously', async () => {
		const code = `
			import { mkdir, readdir } from 'node:fs/promises'

			await mkdir('${testDirPath}')
			const files = await readdir('/')

			export default files.includes('testDir')
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can create and remove a directory asynchronously', async () => {
		const code = `
			import { mkdir, rmdir, readdir } from 'node:fs/promises'

			await mkdir('${testDirPath}')
			await rmdir('${testDirPath}')
			const files = await readdir('/')

			export default !files.includes('testDir')
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can create a temporary directory asynchronously', async () => {
		const code = `
			import { mkdtemp } from 'node:fs/promises'

			const tempDir = await mkdtemp('${tempDirPrefix}')
			const isTempDir = tempDir.startsWith('${tempDirPrefix}')

			export default isTempDir
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})
})
