import { ThreadWorker } from 'poolifier-web-worker'
import { loadQuickJs, type SandboxOptions } from '../../src/index.js'
import type { InputData, ResponseData } from './types.js'

class MyThreadWorker extends ThreadWorker<InputData, ResponseData> {
	runtime?: Awaited<ReturnType<typeof loadQuickJs>>

	constructor() {
		super(async (data?: InputData) => await this.process(data), {
			maxInactiveTime: 10_000,
			killBehavior: 'HARD',
			killHandler: () => {
				this.runtime = undefined
			},
		})
	}

	private async process(data?: InputData): Promise<ResponseData> {
		if (!data?.content) {
			return { id: '', result: { ok: true, data: { ok: true } } }
		}
		if (!this.runtime) {
			this.runtime = await loadQuickJs()
		}

		const options: SandboxOptions = {
			executionTimeout: 10,
			allowFs: true,
			allowFetch: true,
			enableTestUtils: true,
			env: {},
			transformTypescript: true,
			mountFs: {
				src: {
					'test.ts': `export const testFn = (value: string): string => {
            console.log(value)
            return value
          }`,
				},
			},
		}

		return await this.runtime.runSandboxed(async sandbox => {
			const result = await sandbox.evalCode(data.content)

			if (!result.ok && result.error.name === 'ExecutionTimeout') {
				this.runtime = undefined
			}

			return { id: data.id, result }
		}, options)
	}
}

export default new MyThreadWorker()
