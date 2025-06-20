---
title: Usage
description: QuickJS is a small and embeddable JavaScript engine.
order: 0
---

# Usage

## Installation

Install the package using npm, yarn, or bun:

::: code-group

```sh [npm]
npm install @sebastianwessel/quickjs
```

```sh  [bun]
bun add @sebastianwessel/quickjs
```

```sh [yarn]
yarn add @sebastianwessel/quickjs
```

:::

This package is also available at [jsr.io/@sebastianwessel/quickjs](https://jsr.io/@sebastianwessel/quickjs)

### QuickJS Wasm Variant

This library does not include the QuickJS wasm file. It must be installed separat.

The most straight forward variant is `@jitl/quickjs-ng-wasmfile-release-sync`

::: code-group

```sh [npm]
npm install @jitl/quickjs-ng-wasmfile-release-sync
```

```sh  [bun]
bun add @jitl/quickjs-ng-wasmfile-release-sync
```

```sh [yarn]
yarn add @jitl/quickjs-ng-wasmfile-release-sync
```

:::

Please see [github.com/justjake/quickjs-emscripten](https://github.com/justjake/quickjs-emscripten/blob/main/doc/quickjs-emscripten-core/README.md) to find the variant which fits best for your needs.

## Backend Usage

Here's a simple example of how to use the package:

```typescript
import { type SandboxOptions, loadQuickJs } from '../../src/index.js'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs()

const options: SandboxOptions = {
  allowFetch: true, // inject fetch and allow the code to fetch data
  allowFs: true, // mount a virtual file system and provide node:fs module
  env: {
    MY_ENV_VAR: 'env var value',
  },
}

const code = `
import { join } from 'path'

const fn = async ()=>{
  console.log(join('src','dist')) // logs "src/dist" on host system

  console.log(env.MY_ENV_VAR) // logs "env var value" on host system

  const url = new URL('https://example.com')

  const f = await fetch(url)

  return f.text()
}
  
export default await fn()
`

const result = await runSandboxed(async ({ evalCode }) => {
  return evalCode(code)
}, options)

console.log(result)
// { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
```

### Cloudflare Workers

Cloudflare workers have some limitations regarding bundling. The developers of the underlaying quickjs-emscripten library, already solved this.

[github.com/justjake/quickjs-emscripten/tree/main/examples/cloudflare-workers](https://github.com/justjake/quickjs-emscripten/tree/main/examples/cloudflare-workers)

This library will be aligned soon, to support cloudflare as well.

## Usage in Browser

Here is the most minimal example on how to use this library in the browser.
You need to ensure that the WebAssembly file can be loaded correctly. Therefore, you must pass its location to the `loadQuickJs` call.

Using `fetch`is possible, but there are the same restrictions as in any other browser usage (CORS & co).

```html
<!doctype html>
<!-- Import from a ES Module CDN -->
<script type="module">

  import { loadQuickJs } from "https://esm.sh/@sebastianwessel/quickjs@latest"

  const { runSandboxed } = await loadQuickJs('https://esm.sh/@jitl/quickjs-ng-wasmfile-release-sync')

  const options = {
    // [...]
  }

  console.log( await runSandboxed(async ({ evalCode }) => {
    return evalCode("export default 1+1")
    })
  )
</script>
```

Please see the examples in the repository.
