import { ThreadWorker } from 'poolifier-web-worker'
import { quickJS } from '../../src/quickJS.js'
import type { InitResponseType } from '../../src/types/InitResponseType.js'
import type { RuntimeOptions } from '../../src/types/RuntimeOptions.js'
import type { InputData, ResponseData } from './types.js'

class MyThreadWorker extends ThreadWorker<InputData, ResponseData> {
	runtime?: (options?: RuntimeOptions) => Promise<InitResponseType>

	constructor() {
		super(async (data?: InputData) => await this.process(data), {
			maxInactiveTime: 10_000,
		})
	}

	private async process(data?: InputData): Promise<ResponseData> {
		if (!data?.content) {
			return { id: '', result: { ok: true, data: { ok: true } } }
		}
		if (!this.runtime) {
			const { createRuntime } = await quickJS()
			this.runtime = createRuntime
		}

		const { evalCode } = await this.runtime({
			allowFs: true,
			allowFetch: true,
			env: {},
		})

		const result = await evalCode(data.content)
		return { id: data.id, result }
	}
}

export default new MyThreadWorker()
