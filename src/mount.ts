import { readFile, writeFile } from 'node:fs'
import { join } from 'node:path'
import type { QuickJSContext } from 'quickjs-emscripten-core'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

export const mount = (vm: QuickJSContext, options: RuntimeOptions) => {
	const mountPath = options.mountPath
	if (!mountPath) {
		return
	}
	const readFileHandle = vm.newFunction('readFile', pathHandle => {
		const path = vm.getString(pathHandle)
		const promise = vm.newPromise()
		const filename = join(mountPath, path)
		readFile(filename, (err, data) => {
			if (err) {
				promise.reject(vm.newError(err))
			} else {
				promise.resolve(vm.newArrayBuffer(data as unknown as ArrayBufferLike))
			}
		})
		promise.settled.then(vm.runtime.executePendingJobs)
		return promise.handle
	})
	readFileHandle.consume(handle => vm.setProp(vm.global, 'readFile', handle))

	if (!options.allowFileWrite) {
		return
	}
	const writeFileHandle = vm.newFunction('writeFile', (pathHandle, dataHandle) => {
		const path = vm.getString(pathHandle)
		const data = vm.getString(dataHandle)
		const promise = vm.newPromise()
		const filename = join(mountPath, path)
		writeFile(filename, data, err => {
			if (err) {
				promise.reject(vm.newError(err))
			} else {
				promise.resolve()
			}
		})
		promise.settled.then(vm.runtime.executePendingJobs)
		return promise.handle
	})
	writeFileHandle.consume(handle => vm.setProp(vm.global, 'writeFile', handle))
}
