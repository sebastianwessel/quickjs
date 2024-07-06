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
			description: `The javascript code to execute. QuickJS supports ES2023 with async await pattern and top-level await. The javascript has access to the fetch function and to the path module node:path. The result must be exported with __export default__.
      Async functions must be exported with __export default await asyncFunction()__ 
      
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
			description: 'Returns how many FAQ pairs are inserted',
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
						isSyntaxError: true,
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
