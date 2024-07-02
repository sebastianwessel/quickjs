import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import type { StatusCode } from 'hono/utils/http-status'
import { DynamicThreadPool, PoolEvents, availableParallelism } from 'poolifier-web-worker'
import { executeRoute } from './openapi.js'
import type { InputData, ResponseData } from './types.js'

const workerFileURL = new URL('./worker.ts', import.meta.url)

const dynamicPool = new DynamicThreadPool<InputData, ResponseData>(0, availableParallelism(), workerFileURL, {
	errorEventHandler: (e: ErrorEvent) => {
		console.error(e)
	},
	enableTasksQueue: false,
	workerOptions: { type: 'module', smol: true },
})

dynamicPool.eventTarget?.addEventListener(PoolEvents.full, () => console.warn('Pool is full'))
dynamicPool.eventTarget?.addEventListener(PoolEvents.ready, () => console.info('Pool is ready'))
dynamicPool.eventTarget?.addEventListener(PoolEvents.busy, () => console.warn('Pool is busy'))

let count = 0

const app = new OpenAPIHono()

app.openapi(executeRoute, async c => {
	const content = await c.req.text()
	const id = `id_${count++}`

	try {
		const res = await dynamicPool.execute({
			id,
			content,
		})

		let status: StatusCode = 200
		if (res?.result.ok === false) {
			if (res.result.isSyntaxError) {
				status = 400
			}
		}

		return c.json(res?.result, status)
	} catch (error) {
		const err = error as Error
		if (err.message.includes('stack size exceeded')) {
			console.error('POOL_ERROR', 'Too Many Requests')
			return c.text(err.message, 429)
		}

		console.error('POOL_ERROR', err)
		return c.text(err.message, 500)
	}
})

app.get('/', swaggerUI({ url: '/doc' }))
app.doc('/doc', {
	info: {
		title: 'Simple RAG FAQ',
		version: 'v1',
	},
	openapi: '3.1.0',
})

export default app
