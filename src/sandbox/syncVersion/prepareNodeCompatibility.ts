import type { QuickJSContext } from 'quickjs-emscripten-core'
import type { SandboxOptions } from '../../types/SandboxOptions.js'

export const prepareNodeCompatibility = (vm: QuickJSContext, sandboxOptions: SandboxOptions) => {
	vm.unwrapResult(
		vm.evalCode(
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
