import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('sync - node:fs - permissions', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>
	const testFilePath = '/test.txt'
	const testFileContent = 'example content'
	const testDirPath = '/testDir'

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

	it('can change file permissions synchronously', async () => {
		const code = `
			import { writeFileSync, chmodSync, statSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			chmodSync('${testFilePath}', 0o777)
			const stats = statSync('${testFilePath}')

			export default (stats.mode & 0o777) === 0o777
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can change file ownership synchronously', async () => {
		const code = `
			import { writeFileSync, chownSync, statSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			chownSync('${testFilePath}', 1000, 1000)
			const stats = statSync('${testFilePath}')

			export default stats.uid === 1000 && stats.gid === 1000
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can change file permissions asynchronously', async () => {
		const code = `
			import { writeFile, chmod, stat } from 'node:fs/promises'

			await writeFile('${testFilePath}', '${testFileContent}')
			await chmod('${testFilePath}', 0o777)
			const stats = await stat('${testFilePath}')

			export default (stats.mode & 0o777) === 0o777
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can change file ownership asynchronously', async () => {
		const code = `
			import { writeFile, chown, stat } from 'node:fs/promises'

			await writeFile('${testFilePath}', '${testFileContent}')
			await chown('${testFilePath}', 1000, 1000)
			const stats = await stat('${testFilePath}')

			export default stats.uid === 1000 && stats.gid === 1000
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can change directory permissions synchronously', async () => {
		const code = `
			import { mkdirSync, chmodSync, statSync } from 'node:fs'

			mkdirSync('${testDirPath}')
			chmodSync('${testDirPath}', 0o777)
			const stats = statSync('${testDirPath}')

			export default (stats.mode & 0o777) === 0o777
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can change directory ownership synchronously', async () => {
		const code = `
			import { mkdirSync, chownSync, statSync } from 'node:fs'

			mkdirSync('${testDirPath}')
			chownSync('${testDirPath}', 1000, 1000)
			const stats = statSync('${testDirPath}')

			export default stats.uid === 1000 && stats.gid === 1000
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can change directory permissions asynchronously', async () => {
		const code = `
			import { mkdir, chmod, stat } from 'node:fs/promises'

			await mkdir('${testDirPath}')
			await chmod('${testDirPath}', 0o777)
			const stats = await stat('${testDirPath}')

			export default (stats.mode & 0o777) === 0o777
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})

	it('can change directory ownership asynchronously', async () => {
		const code = `
			import { mkdir, chown, stat } from 'node:fs/promises'

			await mkdir('${testDirPath}')
			await chown('${testDirPath}', 1000, 1000)
			const stats = await stat('${testDirPath}')

			export default stats.uid === 1000 && stats.gid === 1000
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toBe(true)
	})
})
