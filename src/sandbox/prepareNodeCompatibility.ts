import type { SandboxOptions } from '../types/SandboxOptions.js'
import type { VMContext } from '../types/VMContext.js'

export const prepareNodeCompatibility = (vm: VMContext, sandboxOptions: SandboxOptions) => {
	const handle = vm.unwrapResult(
		vm.evalCode(
			`
      import 'node:buffer';
      import 'node:util';
      ${sandboxOptions.enableTestUtils ? "import 'test'" : ''}
      `,
			undefined,
			{ type: 'module' },
		),
	)
	handle.dispose()
}
