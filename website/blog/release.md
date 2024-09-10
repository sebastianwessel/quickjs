---
title: "Announcing QuickJS 1.0.0"
description: "Version 1.0 of the QuickJS package is released. A TypeScript package that allows you to safely execute JavaScript code within a WebAssembly sandbox using the QuickJS engine."
date: 2024-07-07 12:00:00
categories: release
---

## Announcing QuickJS 1.0.0

We are excited to announce the release of **QuickJS 1.0.0**, a TypeScript package that allows you to safely execute JavaScript code within a WebAssembly sandbox using the QuickJS engine. Perfect for isolating and running untrusted code securely, QuickJS leverages the lightweight and fast QuickJS engine compiled to WebAssembly, providing a robust environment for code execution.

### Key Features

- **Security**: Run untrusted JavaScript code in a safe, isolated environment.
- **File System**: Can mount a virtual file system.
- **Custom Node Modules**: Custom node modules are mountable.
- **Fetch Client**: Can provide a fetch client to make http(s) calls.
- **Test-Runner**: Includes a test runner and chai-based `expect`.
- **Performance**: Benefit from the lightweight and efficient QuickJS engine.
- **Versatility**: Easily integrate with existing TypeScript projects.
- **Simplicity**: User-friendly API for executing and managing JavaScript code in the sandbox.

### Full Documentation and Examples

- **[View the full documentation](https://sebastianwessel.github.io/quickjs/)**
- **[Find examples in the repository](https://github.com/sebastianwessel/quickjs/tree/main/example)**

### Basic Usage Example

Here's a simple example of how to use the package:

```typescript
import { quickJS } from '@sebastianwessel/quickjs'

// General setup like loading and init of the QuickJS wasm
// It is a resource-intensive job and should be done only once if possible 
const { createRuntime } = await quickJS()

// Create a runtime instance each time a js code should be executed
const { evalCode } = await createRuntime({
  allowFetch: true, // inject fetch and allow the code to fetch data
  allowFs: true, // mount a virtual file system and provide node:fs module
  env: {
    MY_ENV_VAR: 'env var value'
  },
})

const result = await evalCode(`
import { join } as path from 'path'

const fn = async () => {
  console.log(join('src','dist')) // logs "src/dist" on host system

  console.log(env.MY_ENV_VAR) // logs "env var value" on host system

  const url = new URL('https://example.com')

  const f = await fetch(url)

  return f.text()
}

export default await fn()
`)

console.log(result) // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
```

### Credits

This library is based on:

- [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten)
- [quickjs-emscripten-sync](https://github.com/reearth/quickjs-emscripten-sync)
- [memfs](https://github.com/streamich/memfs)

Tools used:

- [Bun](https://bun.sh)
- [Biome](https://biomejs.dev)
- [Hono](https://hono.dev)
- [poolifier-web-worker](https://github.com/poolifier/poolifier-web-worker)
- [tshy](https://github.com/isaacs/tshy)
- [autocannon](https://github.com/mcollina/autocannon)

### License

This project is licensed under the MIT License.

---

QuickJS 1.0.0 is ideal for developers looking to execute JavaScript code securely within a TypeScript application, ensuring both performance and safety with the QuickJS WebAssembly sandbox. Try it out and let us know what you think!

[Check out QuickJS on GitHub](https://github.com/sebastianwessel/quickjs)
