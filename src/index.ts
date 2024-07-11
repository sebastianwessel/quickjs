/**
 * QuickJS sandbox for JavaScript/Typescript applications
 *
 * This TypeScript package allows you to safely execute JavaScript code within a WebAssembly sandbox using the QuickJS engine.
 * Perfect for isolating and running untrusted code securely, it leverages the lightweight and fast QuickJS engine compiled to WebAssembly, providing a robust environment for code execution.
 *
 * @author Sebastian Wessel
 * @copyright Sebastian Wessel
 * @license MIT
 * @link https://sebastianwessel.github.io/quickjs/
 * @link https://github.com/sebastianwessel/quickjs
 *
 * @example
 * ```typescript
 * import { quickJS } from '@sebastianwessel/quickjs'
 *
 * // General setup like loading and init of the QuickJS wasm
 * // It is a ressource intensive job and should be done only once if possible
 * const { createRuntime } = await quickJS()
 *
 * // Create a runtime instance each time a js code should be executed
 * const { evalCode } = await createRuntime({
 *   allowFetch: true, // inject fetch and allow the code to fetch data
 *   allowFs: true, // mount a virtual file system and provide node:fs module
 *   env: {
 *     MY_ENV_VAR: 'env var value'
 *   },
 * })
 *
 *
 * const result = await evalCode(`
 * import { join } as path from 'path'
 *
 * const fn = async ()=>{
 *   console.log(join('src','dist')) // logs "src/dist" on host system
 *
 *   console.log(env.MY_ENV_VAR) // logs "env var value" on host system
 *
 *   const url = new URL('https://example.com')
 *
 *   const f = await fetch(url)
 *
 *   return f.text()
 * }
 *
 * export default await fn()
 * `)
 *
 * console.log(result) // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
 * ```
 *
 *
 * @module
 */

export * from './quickJS.js'
export * from './types/RuntimeOptions.js'
export * from './sync/index.js'
export * from './types/ErrorResponse.js'
export * from './types/InitResponseType.js'
export * from './types/OkResponse.js'
export * from './types/QuickJSEvalReturn.js'
export * from './adapter/fetch.js'
export * from './createVirtualFileSystem.js'
export * from './types/OkResponseCheck.js'
export * from './getTypescriptSupport.js'
export * from './modulePathNormalizer.js'
