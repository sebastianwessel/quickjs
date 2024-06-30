import { ThreadWorker } from 'poolifier-web-worker'
import { quickJS } from '../../src/quickJS.js'
import type { Arena } from '../../src/sync/index.js'
import type { RuntimeOptions } from '../../src/types/RuntimeOptions.js'

export interface MyData {
	id: string
	content: string
}

export type OkResponse<T = unknown> = {
	ok: true
	data: T
}

export type ErrorResponse = {
	ok: false
	error: Error
	isSyntaxError?: boolean
}

export interface MyResponse {
	id: string
	result: OkResponse | ErrorResponse
}

class MyThreadWorker extends ThreadWorker<MyData, MyResponse> {
	initRuntime?: (options?: RuntimeOptions) => Promise<{
		vm: Arena
		dispose: () => void
	}>

	constructor() {
		super(async (data?: MyData) => await this.process(data), {
			maxInactiveTime: 10_000,
		})
	}

	private async process(data?: MyData): Promise<MyResponse> {
		if (!data?.content) {
			return { id: '', result: { ok: true, data: { ok: true } } }
		}
		if (!this.initRuntime) {
			const { initRuntime } = await quickJS()
			this.initRuntime = initRuntime
		}

		const { vm, dispose } = await this.initRuntime({
			allowHttp: true,
			env: {},
		})

		try {
			const result = await vm.evalCode(data.content, 'index.js')
			return { id: data.id, result: { ok: true, data: result.quickJSResult } }
		} catch (err) {
			console.error('WORKER-ERROR', err)

			const e = err as Error

			return {
				id: data.id,
				result: {
					ok: false,
					error: {
						name: `${e.name}`,
						message: `${e.message}`,
						stack: `${e.stack}`,
					},
					isSyntaxError: e.name === 'SyntaxError',
				},
			}
		} finally {
			try {
				dispose()
			} catch (error) {
				console.error('WORKER DISPOSE', error)
			}
		}
	}
}

export default new MyThreadWorker()
