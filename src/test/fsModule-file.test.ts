import { describe, expect, it } from 'bun:test'
import { quickJS } from '../quickJS.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('node:fs - file', () => {
	const testFilePath = '/test.txt'
	const testFileContent = 'example content'

	it('can write and read a file synchronously', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { writeFileSync, readFileSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			const fileContent = readFileSync('${testFilePath}', 'utf-8')

			export default fileContent
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFileContent)
	})

	it('can append to a file', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })
		const appendedContent = ' - appended text'

		const code = `
			import { writeFileSync, appendFileSync, readFileSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			appendFileSync('${testFilePath}', '${appendedContent}')
			const fileContent = readFileSync('${testFilePath}', 'utf-8')

			export default fileContent
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFileContent + appendedContent)
	})

	it('can check file existence', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { writeFileSync, existsSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			const fileExists = existsSync('${testFilePath}')

			export default fileExists
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(true)
	})

	it('can read and write file asynchronously', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { writeFile, readFile } from 'node:fs/promises'

			await writeFile('${testFilePath}', '${testFileContent}')
			const fileContent = await readFile('${testFilePath}', 'utf-8')

			export default await fileContent
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFileContent)
	})

	it('can rename a file', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })
		const newFilePath = '/renamed.txt'

		const code = `
			import { writeFileSync, renameSync, readFileSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			renameSync('${testFilePath}', '${newFilePath}')
			const fileContent = readFileSync('${newFilePath}', 'utf-8')

			export default fileContent
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(testFileContent)
	})

	it('can delete a file', async () => {
		const { createRuntime } = await quickJS()
		const { evalCode } = await createRuntime({ allowFs: true })

		const code = `
			import { writeFileSync, unlinkSync, existsSync } from 'node:fs'

			writeFileSync('${testFilePath}', '${testFileContent}')
			unlinkSync('${testFilePath}')
			const fileExists = existsSync('${testFilePath}')

			export default fileExists
		`

		const result = (await evalCode(code)) as OkResponse
		expect(result.ok).toBeTrue()
		expect(result.data).toBe(false)
	})
})
