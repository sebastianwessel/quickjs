import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type NestedDirectoryJSON, memfs } from 'memfs'
import assertModule from './modules/assert.js'
import bufferModule from './modules/buffer.js'
import fsPromisesModule from './modules/fs-promises.js'
import fsModule from './modules/fs.js'
import moduleModule from './modules/module.js'
import pathModule from './modules/path.js'
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
				buffer: {
					'index.js': bufferModule,
				},
				fs: { 'index.js': fsModule, promises: { 'index.js': fsPromisesModule } },
				module: {
					'index.js': moduleModule,
				},
				path: {
					'index.js': pathModule,
				},
				util: {
					'index.js': utilModule,
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
