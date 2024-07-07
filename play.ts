import { quickJS } from './src/quickJS.js'

const code = `export default await new Promise((resolve)=> setTimeout(()=>resolve('DONE'), 20_000))
`

let runtime: Awaited<ReturnType<typeof quickJS>> | undefined

while (true) {
	if (!runtime) {
		runtime = await quickJS()
	}

	const { evalCode } = await runtime.createRuntime({
		executionTimeout: 2,
		allowFs: true,
		allowFetch: true,
		env: {},
	})

	const result = await evalCode(code)

	console.log(result)

	if (!result.ok && result.error.name === 'ExecutionTimeout') {
		runtime = undefined
	}
}
