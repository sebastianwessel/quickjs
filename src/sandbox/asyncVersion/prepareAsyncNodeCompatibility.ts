import type { QuickJSAsyncContext } from 'quickjs-emscripten-core'
import type { SandboxAsyncOptions } from '../../types/SandboxOptions.js'

export const prepareAsyncNodeCompatibility = async (vm: QuickJSAsyncContext, sandboxOptions: SandboxAsyncOptions) => {
	vm.unwrapResult(
		await vm.evalCodeAsync(
			`
      import 'node:buffer';
      import 'node:util';
      import 'node:url';
      import '@node_compatibility/headers';
      import '@node_compatibility/request';
      import '@node_compatibility/response';
      ${sandboxOptions.enableTestUtils ? "import 'test'" : ''}
      `,
			undefined,
			{ type: 'module' },
		),
	).dispose()
}
