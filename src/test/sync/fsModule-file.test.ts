import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'

describe('node:fs - file', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>
	const testFilePath = '/test.txt'
	const testFileContent = 'example content'

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

	it('can write and read a file synchronously', async () => {
		const code = `
			import { writeFileSync, readFileSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			const fileContent = readFileSync('${testFilePath}', 'utf-8')

			export default fileContent
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFileContent)
	})

	it('can append to a file', async () => {
		const appendedContent = ' - appended text'
		const code = `
			import { writeFileSync, appendFileSync, readFileSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			appendFileSync('${testFilePath}', '${appendedContent}')
			const fileContent = readFileSync('${testFilePath}', 'utf-8')

			export default fileContent
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFileContent + appendedContent)
	})

	it('can check file existence', async () => {
		const code = `
			import { writeFileSync, existsSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			const fileExists = existsSync('${testFilePath}')

			export default fileExists
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can read and write file asynchronously', async () => {
		const code = `
			import { writeFile, readFile } from 'node:fs/promises'

			await writeFile('${testFilePath}', '${testFileContent}')
			const fileContent = await readFile('${testFilePath}', 'utf-8')

			export default fileContent
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFileContent)
	})

	it('can rename a file', async () => {
		const newFilePath = '/renamed.txt'
		const code = `
			import { writeFileSync, renameSync, readFileSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			renameSync('${testFilePath}', '${newFilePath}')
			const fileContent = readFileSync('${newFilePath}', 'utf-8')

			export default fileContent
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFileContent)
	})

	it('can delete a file', async () => {
		const code = `
			import { writeFileSync, unlinkSync, existsSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			unlinkSync('${testFilePath}')
			const fileExists = existsSync('${testFilePath}')

			export default fileExists
		`

		const result = await runCode(code)
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(false)
	})
})
