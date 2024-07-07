import { join } from 'node:path'

const testRunnerResult = await Bun.build({
	entrypoints: ['./vendor/testrunner/testRunner.ts'],
	format: 'esm',
	minify: true,
})

for (const res of testRunnerResult.outputs) {
	const content = await res.text()

	Bun.write(join('src', 'modules', 'build', 'test-lib.js'), content)

	console.info('test lib generated')
}
