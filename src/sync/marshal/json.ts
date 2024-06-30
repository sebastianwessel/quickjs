import type { QuickJSContext, QuickJSHandle } from 'quickjs-emscripten-core'

import { json } from '../vmutil.js'

export default function marshalJSON(
	ctx: QuickJSContext,
	target: unknown,
	preMarshal: (target: unknown, handle: QuickJSHandle) => QuickJSHandle | undefined,
): QuickJSHandle {
	const raw = json(ctx, target)
	const handle = preMarshal(target, raw) ?? raw
	return handle
}
