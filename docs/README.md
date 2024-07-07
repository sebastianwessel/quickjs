---
title: QuickJS - Execute JavaScript in a WebAssembly QuickJS Sandbox
description: Run custom javascript inside a webassembly runtime from your Javascript/Typescript application
---

This TypeScript package allows you to safely execute JavaScript code within a WebAssembly sandbox using the QuickJS engine. Perfect for isolating and running untrusted code securely, it leverages the lightweight and fast QuickJS engine compiled to WebAssembly, providing a robust environment for code execution.

- [Installation](./intallation.md)
- Compatibility:
  - [Core Javascript](./core-js-compatibility.md)
  - [NodeJS](./node-compatibility.md)
- [Runtime options](./runtime-options.md)
- [Run Tests in QuickJS](./running-tests.md)
- [Credits](./credits.md)

## Features

- **Security**: Run untrusted JavaScript code in a safe, isolated environment.
- **File System**: Can mount a virtual file system
- **Custom Node Modules**: Custom node modules are mountable
- **Fetch Client**: Can provide a fetch client to make http(s) calls
- **Test-Runner**: Includes a test runner and chai based `expect`
- **Performance**: Benefit from the lightweight and efficient QuickJS engine.
- **Versatility**: Easily integrate with existing TypeScript projects.
- **Simplicity**: User-friendly API for executing and managing JavaScript code in the sandbox.

**[View the full documentation](https://sebastianwessel.github.io/quickjs/)**

**[Find examples in the repository](https://github.com/sebastianwessel/quickjs/tree/main/example)**

## Basic Usage

Here's a simple example of how to use the package:

```typescript
import { quickJS } from '@sebastianwessel/quickjs'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible 
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

const fn = async ()=>{
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

## Credits

This lib is based on:

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

## License

This project is licensed under the MIT License.

---

This package is ideal for developers looking to execute JavaScript code securely within a TypeScript application, ensuring both performance and safety with the QuickJS WebAssembly sandbox.
