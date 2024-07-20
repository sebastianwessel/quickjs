import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../loadQuickJs.js'
import type { OkResponse } from '../types/OkResponse.js'

describe.skip('node:fs - links', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>
	const testFilePath = '/test.txt'
	const testFileContent = 'example content'
	const linkPath = '/testLink.txt'
	const hardLinkPath = '/testHardLink.txt'

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	const runCode = async (code: string): Promise<OkResponse> => {
		return await runtime.runSandboxed(
			async ({ evalCode }) => {
				return (await evalCode(code)) as OkResponse
			},
			{ allowFs: true },
		)
	}

	it('can create a symbolic link synchronously', async () => {
		const code = `
			import { writeFileSync, symlinkSync, readlinkSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			symlinkSync('${testFilePath}', '${linkPath}')
			const linkTarget = readlinkSync('${linkPath}')

			export default linkTarget
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFilePath)
	})

	it('can create a symbolic link asynchronously', async () => {
		const code = `
			import { writeFile, symlink, readlink } from 'node:fs/promises'

			await writeFile('${testFilePath}', '${testFileContent}')
			await symlink('${testFilePath}', '${linkPath}')
			const linkTarget = await readlink('${linkPath}')

			export default linkTarget
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFilePath)
	})

	it('can create a hard link synchronously', async () => {
		const code = `
			import { writeFileSync, linkSync, statSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			linkSync('${testFilePath}', '${hardLinkPath}')
			const statsOriginal = statSync('${testFilePath}')
			const statsLink = statSync('${hardLinkPath}')

			export default statsOriginal.ino === statsLink.ino
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can create a hard link asynchronously', async () => {
		const code = `
			import { writeFile, link, stat } from 'node:fs/promises'

			await writeFile('${testFilePath}', '${testFileContent}')
			await link('${testFilePath}', '${hardLinkPath}')
			const statsOriginal = await stat('${testFilePath}')
			const statsLink = await stat('${hardLinkPath}')

			export default statsOriginal.ino === statsLink.ino
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can resolve a symbolic link path synchronously', async () => {
		const code = `
			import { writeFileSync, symlinkSync, realpathSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			symlinkSync('${testFilePath}', '${linkPath}')
			const resolvedPath = realpathSync('${linkPath}')

			export default resolvedPath
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFilePath)
	})

	it('can resolve a symbolic link path asynchronously', async () => {
		const code = `
			import { writeFile, symlink, realpath } from 'node:fs/promises'

			await writeFile('${testFilePath}', '${testFileContent}')
			await symlink('${testFilePath}', '${linkPath}')
			const resolvedPath = await realpath('${linkPath}')

			export default resolvedPath
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFilePath)
	})

	it('can unlink a symbolic link synchronously', async () => {
		const code = `
			import { writeFileSync, symlinkSync, unlinkSync, existsSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			symlinkSync('${testFilePath}', '${linkPath}')
			unlinkSync('${linkPath}')
			const linkExists = existsSync('${linkPath}')

			export default linkExists
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(false)
	})

	it('can unlink a symbolic link asynchronously', async () => {
		const code = `
			import { writeFile, symlink, unlink, access } from 'node:fs/promises'

			await writeFile('${testFilePath}', '${testFileContent}')
			await symlink('${testFilePath}', '${linkPath}')
			await unlink('${linkPath}')
			let linkExists = true
			try {
				await access('${linkPath}')
			} catch {
				linkExists = false
			}

			export default linkExists
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(false)
	})
})
