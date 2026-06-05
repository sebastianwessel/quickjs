import { createRoute, z } from '@hono/zod-openapi'

export const executeRoute = createRoute({
	method: 'post',
	path: '/execute',
	request: {
		body: {
			content: {
				'text/plain': {
					schema: z.string(),
					example: `import * as path from 'path'

const fn = async ()=>{
console.log(path.join('src','dist'))

  const url = new URL('https://example.com')

  const f = await fetch(url)

  return f.text()
  }
  
export default await fn()
      `,
				},
			},
			description: `The JavaScript code to execute. QuickJS supports ES2023, async functions, and top-level await. The sandbox has access to fetch, the virtual file system, test helpers, and bundled Node compatibility modules such as node:path. Export the result with __export default value__. Async functions can be exported with __export default await asyncFunction()__.
      
      `,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.object({
						ok: z.boolean(),
						isSyntaxError: z.boolean().optional(),
						error: z.any().optional(),
						data: z.any().optional(),
					}),
					example: {
						ok: true,
						data: 'the execution result',
					},
				},
			},
			description: 'The result of the code execution',
		},
		400: {
			content: {
				'application/json': {
					schema: z.object({
						ok: z.boolean(),
						isSyntaxError: z.boolean().optional(),
						error: z.any().optional(),
						data: z.any().optional(),
					}),
					example: {
						ok: false,
						error: {
							name: 'SyntaxError',
							message: 'unexpected end of string',
							stack: '    at index.js:7:26\n',
						},
						isSyntaxError: true,
					},
				},
			},
			description: 'The submitted code is not valid JavaScript',
		},
		408: {
			content: {
				'application/json': {
					schema: z.object({
						ok: z.boolean(),
						isSyntaxError: z.boolean().optional(),
						error: z.any().optional(),
						data: z.any().optional(),
					}),
					example: {
						ok: false,
						error: {
							name: 'ExecutionTimeout',
							message: 'The script execution has exceeded the maximum allowed time limit.',
						},
						isSyntaxError: false,
					},
				},
			},
			description: 'The execution exceeded the maximum time limit',
		},
		429: {
			content: {
				'text/plain': {
					schema: z.string(),
					example: 'stack size exceeded',
				},
			},
			description: 'Reject the request if there is no capacity left to execute code',
		},
		500: {
			content: {
				'text/plain': {
					schema: z.string(),
					example: 'Internal server error',
				},
			},
			description: 'Returns some error on general failure',
		},
	},
})
