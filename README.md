# QuickJS package

**@sebastianwessel/quickjs: Execute JavaScript in a WebAssembly QuickJS Sandbox**

This TypeScript package allows you to safely execute JavaScript code within a WebAssembly sandbox using the QuickJS engine. Perfect for isolating and running untrusted code securely, it leverages the lightweight and fast QuickJS engine compiled to WebAssembly, providing a robust environment for code execution.

## Features

- **Security**: Run untrusted JavaScript code in a safe, isolated environment.
- **Performance**: Benefit from the lightweight and efficient QuickJS engine.
- **Versatility**: Easily integrate with existing TypeScript projects.
- **Simplicity**: User-friendly API for executing and managing JavaScript code in the sandbox.
- **Worker Pools**: Can use worker pools to not block the main loop

## Installation

Install the package using npm, yarn, or bun:

```sh
npm install @sebastianwessel/quickjs
```

or

```sh
bun add @sebastianwessel/quickjs
```

or

```sh
yarn add @sebastianwessel/quickjs
```

## Usage

Here's a simple example of how to use the package:

```typescript
import { quickJS } from '@sebastianwessel/quickjs'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible 
const { initRuntime } = await quickJS()

// Create a runtime instance each time a js code should be executed
const { evalCode } = await this.initRuntime({
  allowHttp: true, // inject fetch and allow the code to fetch data
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

## License

This project is licensed under the MIT License.

---

This package is ideal for developers looking to execute JavaScript code securely within a TypeScript application, ensuring both performance and safety with the QuickJS WebAssembly sandbox.
