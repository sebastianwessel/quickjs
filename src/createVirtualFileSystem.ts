import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type NestedDirectoryJSON, memfs } from 'memfs'
import assertModule from './modules/assert.js'
import bufferModule from './modules/buffer.js'
import fsPromisesModule from './modules/fs-promises.js'
import fsModule from './modules/fs.js'
import moduleModule from './modules/module.js'
import pathModule from './modules/path.js'
import processModule from './modules/process.js'
import punycodeModule from './modules/punycode.js'
import queryStringModule from './modules/querystring.js'
import stringDecoderModule from './modules/string_decoder.js'
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
	// setup node_modules folder
	const virtualFS: Record<string, any> = {
		'/': {
			...runtimeOptions.mountFs,
			src: {
				// biome-ignore lint/complexity/useLiteralKeys: <explanation>
				...(runtimeOptions.mountFs?.['src'] ? (runtimeOptions.mountFs?.['src'] as NestedDirectoryJSON) : {}),
			},
			node_modules: {
				...runtimeOptions?.nodeModules,
				assert: {
					'index.js': assertModule,
				},
				async_hooks: {
					'index.js': "throw new Error('Not implemented')",
				},
				buffer: {
					'index.js': bufferModule,
				},
				child_process: {
					'index.js': "throw new Error('Not implemented')",
				},
				cluster: {
					'index.js': "throw new Error('Not implemented')",
				},
				console: {
					'index.js': "throw new Error('Not implemented')",
				},
				crypto: {
					'index.js': "throw new Error('Not implemented')",
				},
				dgram: {
					'index.js': "throw new Error('Not implemented')",
				},
				dns: {
					'index.js': "throw new Error('Not implemented')",
				},
				domain: {
					'index.js': "throw new Error('Not implemented')",
				},
				events: {
					'index.js': "throw new Error('Not implemented')",
				},
				fs: {
					'index.js': fsModule,
					promises: {
						'index.js': fsPromisesModule,
					},
				},
				http: {
					'index.js': "throw new Error('Not implemented')",
				},
				http2: {
					'index.js': "throw new Error('Not implemented')",
				},
				https: {
					'index.js': "throw new Error('Not implemented')",
				},
				inspector: {
					'index.js': "throw new Error('Not implemented')",
				},
				module: {
					'index.js': moduleModule,
				},
				net: {
					'index.js': "throw new Error('Not implemented')",
				},
				os: {
					'index.js': "throw new Error('Not implemented')",
				},
				path: {
					'index.js': pathModule,
				},
				perf_hooks: {
					'index.js': "throw new Error('Not implemented')",
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
					'index.js': "throw new Error('Not implemented')",
				},
				repl: {
					'index.js': "throw new Error('Not implemented')",
				},
				stream: {
					'index.js': "throw new Error('Not implemented')",
				},
				string_decoder: {
					'index.js': stringDecoderModule,
				},
				timers: {
					'index.js': "throw new Error('Not implemented')",
				},
				tls: {
					'index.js': "throw new Error('Not implemented')",
				},
				trace_events: {
					'index.js': "throw new Error('Not implemented')",
				},
				tty: {
					'index.js': "throw new Error('Not implemented')",
				},
				url: {
					'index.js': urlModule,
				},
				util: {
					'index.js': utilModule,
				},
				v8: {
					'index.js': "throw new Error('Not implemented')",
				},
				vm: {
					'index.js': "throw new Error('Not implemented')",
				},
				worker_threads: {
					'index.js': "throw new Error('Not implemented')",
				},
				zlib: {
					'index.js': "throw new Error('Not implemented')",
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
