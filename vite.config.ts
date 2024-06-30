/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [
		dts({
			rollupTypes: true,
		}),
	],
	build: {
		target: 'es2015',
		lib: {
			formats: ['es', 'umd'],
			entry: 'src/index.ts',
			name: 'QuickjsEmscriptenSync',
		},
		rollupOptions: {
			external: ['quickjs-emscripten'],
			output: {
				globals: {
					'quickjs-emscripten': 'QuickjsEmscripten',
				},
			},
		},
	},
	test: {
		coverage: {
			reporter: ['text', 'json'],
		},
	},
})
