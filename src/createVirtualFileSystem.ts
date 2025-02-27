import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type NestedDirectoryJSON, memfs } from 'memfs'
import assertModule from './modules/assert.js'
import bufferModule from './modules/buffer.js'
import eventModule from './modules/events.js'
import fsModule from './modules/fs.js'
import fsPromisesModule from './modules/fs_promises.js'
import moduleModule from './modules/module.js'
import compatibilityHeaders from './modules/nodeCompatibility/headers.js'
import compatibilityRequest from './modules/nodeCompatibility/request.js'
import compatibilityResponse from './modules/nodeCompatibility/response.js'
import pathModule from './modules/path.js'
import processModule from './modules/process.js'
import punycodeModule from './modules/punycode.js'
import queryStringModule from './modules/querystring.js'
import stringDecoderModule from './modules/string_decoder.js'
import timersModule from './modules/timers.js'
import timersPromisesModule from './modules/timers_promises.js'
import urlModule from './modules/url.js'
import utilModule from './modules/util.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

/**
 * Create the virtual file system for the sandbox
 * Creates a node_modules folder with packages and ensures the src folder
 *
 * @param runtimeOptions
 * @returns filesystem fs and volume vol
 */
export const createVirtualFileSystem = (runtimeOptions: RuntimeOptions = {}) => {
	const customFileSystem = runtimeOptions.mountFs

	// setup node_modules folder
	const virtualFS: Record<string, any> = {
		'/': {
			...customFileSystem,
			src: {
				// biome-ignore lint/complexity/useLiteralKeys: <explanation>
				...(customFileSystem?.['src'] ? (customFileSystem?.['src'] as NestedDirectoryJSON) : {}),
			},
			node_modules: {
				...runtimeOptions?.nodeModules,
				'@node_compatibility': {
					headers: compatibilityHeaders,
					request: compatibilityRequest,
					response: compatibilityResponse,
				},
				assert: {
					'index.js': assertModule,
				},

				async_hooks: {
					'index.js': "throw new Error('module async_hooks not implemented')",
				},
				buffer: {
					'index.js': bufferModule,
				},
				child_process: {
					'index.js': "throw new Error('module child_process not implemented')",
				},
				cluster: {
					'index.js': "throw new Error('module cluster not implemented')",
				},
				console: {
					'index.js': "throw new Error('module console not implemented')",
				},
				crypto: {
					'index.js': "throw new Error('module crypto not implemented')",
				},
				dgram: {
					'index.js': "throw new Error('module dgram not implemented')",
				},
				dns: {
					'index.js': "throw new Error('module dns not implemented')",
				},
				domain: {
					'index.js': "throw new Error('module domain not implemented')",
				},
				events: {
					'index.js': eventModule,
				},
				fs: {
					'index.js': fsModule,
					promises: {
						'index.js': fsPromisesModule,
					},
				},
				http: {
					'index.js': "throw new Error('module http not implemented')",
				},
				http2: {
					'index.js': "throw new Error('module http2 not implemented')",
				},
				https: {
					'index.js': "throw new Error('module https not implemented')",
				},
				inspector: {
					'index.js': "throw new Error('module inspector not implemented')",
				},
				module: {
					'index.js': moduleModule,
				},
				net: {
					'index.js': "throw new Error('module net not implemented')",
				},
				os: {
					'index.js': "throw new Error('module os not implemented')",
				},
				path: {
					'index.js': pathModule,
				},
				perf_hooks: {
					'index.js': "throw new Error('module perf_hooks not implemented')",
				},
				process: {
					'index.js': processModule,
				},
				punycode: {
					'index.js': punycodeModule,
				},
				querystring: {
					'index.js': queryStringModule,
				},
				readline: {
					'index.js': "throw new Error('module readline not implemented')",
				},
				repl: {
					'index.js': "throw new Error('module repl not implemented')",
				},
				stream: {
					'index.js': "throw new Error('module stream not implemented')",
				},
				string_decoder: {
					'index.js': stringDecoderModule,
				},
				timers: {
					'index.js': timersModule,
					promises: {
						'index.js': timersPromisesModule,
					},
				},
				tls: {
					'index.js': "throw new Error('module tls not implemented')",
				},
				trace_events: {
					'index.js': "throw new Error('module trace_events not implemented')",
				},
				tty: {
					'index.js': "throw new Error('module tty not implemented')",
				},
				url: {
					'index.js': urlModule,
				},
				util: {
					'index.js': utilModule,
				},
				v8: {
					'index.js': "throw new Error('module v8 not implemented')",
				},
				vm: {
					'index.js': "throw new Error('module vm not implemented')",
				},
				worker_threads: {
					'index.js': "throw new Error('module worker_threads not implemented')",
				},
				zlib: {
					'index.js': "throw new Error('module zlib not implemented')",
				},
			},
		},
	}

	if (runtimeOptions.enableTestUtils) {
		virtualFS['/'].node_modules.test = {
			'index.js': readFileSync(join(__dirname, 'modules', 'build', 'test-lib.js')),
		}
	}

	const { vol, fs } = memfs(virtualFS, '/')

	return { vol, fs }
}
