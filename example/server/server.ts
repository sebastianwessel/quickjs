import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { DynamicThreadPool, PoolEvents, availableParallelism } from 'poolifier-web-worker'
import type { MyData, MyResponse } from './worker'

const workerFileURL = new URL('./worker.ts', import.meta.url)

const dynamicPool = new DynamicThreadPool<MyData, MyResponse>(0, availableParallelism(), workerFileURL, {
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

Bun.serve({
	async fetch(_req) {
		const id = `id_${count++}`

		try {
			const res = await dynamicPool.execute({
				id,
				content: `
        import * as path from 'path'

        const fn = async ()=>{
        console.log(path.join('src','dist'))

          const url = new URL('https://example.com')

          const f = await fetch(url)

          return f.text()
          }
          
        export const quickJSResult = await fn()
      `,
			})

			let status = 200
			if (res?.result.ok === false) {
				if (res.result.isSyntaxError) {
					status = 400
				}
			}

			return new Response(JSON.stringify(res?.result, null, 2), {
				headers: [['content-type', 'application/json']],
				status,
			})
		} catch (error) {
			const err = error as Error
			if (err.message.includes('stack size exceeded')) {
				console.error('POOL_ERROR', 'Too Many Requests')
				return new Response('Too Many Requests', { status: 429 })
			}

			console.error('POOL_ERROR', err)
			return new Response(err.message, { status: 500 })
		}
	},
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
