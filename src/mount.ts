import { memfs } from 'memfs'
import type { Arena } from './sync/index.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

export const mount = (vm: Arena, options: RuntimeOptions) => {
	if (!options.allowFs) {
		return
	}

	const { vol } = memfs(options.mountFs ?? { src: {} }, '/')

	vm.expose({
		__fs: {
			access: (...params: Parameters<typeof vol.access>) => vol.access(...params),
			accessSync: (...params: Parameters<typeof vol.accessSync>) => vol.accessSync(...params),
			appendFile: (...params: Parameters<typeof vol.appendFile>) => vol.appendFile(...params),
			appendFileSync: (...params: Parameters<typeof vol.appendFileSync>) => vol.appendFileSync(...params),
			chmod: (...params: Parameters<typeof vol.chmod>) => vol.chmod(...params),
			chmodSync: (...params: Parameters<typeof vol.chmodSync>) => vol.chmodSync(...params),
			readFileSync: (...params: Parameters<typeof vol.readFileSync>) => vol.readFileSync(...params).toString(),
			writeFileSync: (...params: Parameters<typeof vol.writeFileSync>) => {
				vol.writeFileSync(...params)
			},
			existsSync: (...params: Parameters<typeof vol.existsSync>) => vol.existsSync(...params),
		},
	})
}
