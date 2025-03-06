# QuickJS - Execute JavaScript and TypeScript in a WebAssembly QuickJS Sandbox

This TypeScript package allows you to safely execute **JavaScript AND TypeScript code** within a WebAssembly sandbox using the QuickJS engine. Perfect for isolating and running untrusted code securely, it leverages the lightweight and fast QuickJS engine compiled to WebAssembly, providing a robust environment for code execution.

**[View the full documentation](https://sebastianwessel.github.io/quickjs/)** | **[Find examples in the repository](https://github.com/sebastianwessel/quickjs/tree/main/example)** | **[Online Playground](https://sebastianwessel.github.io/quickjs/playground.html)**

## Features

- **Security**: Run untrusted JavaScript and TypeScript code in a safe, isolated environment.
- **Basic Node.js modules**: Provides basic standard Node.js module support for common use cases.
- **File System**: Can mount a virtual file system.
- **Custom Node Modules**: Custom node modules are mountable.
- **Fetch Client**: Can provide a fetch client to make http(s) calls.
- **Test-Runner**: Includes a test runner and chai based `expect`.
- **Performance**: Benefit from the lightweight and efficient QuickJS engine.
- **Versatility**: Easily integrate with existing TypeScript projects.
- **Simplicity**: User-friendly API for executing and managing JavaScript and TypeScript code in the sandbox.

## Basic Usage

Here's a simple example of how to use the package:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

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

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result) // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
```

**[View the full documentation](https://sebastianwessel.github.io/quickjs/)**

**[Find examples in the repository](https://github.com/sebastianwessel/quickjs/tree/main/example)**

## Credits

This lib is based on:

- [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten)
- [quickjs-emscripten-sync](https://github.com/reearth/quickjs-emscripten-sync)
- [memfs](https://github.com/streamich/memfs)
- [Chai](https://www.chaijs.com)

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
