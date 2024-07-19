import type { QuickJSAsyncWASMModule, QuickJSWASMModule } from 'quickjs-emscripten-core'
import type { Prettify } from './Prettify.js'

export type LoadQuickJsOptions = Prettify<string | QuickJSWASMModule | QuickJSAsyncWASMModule>
