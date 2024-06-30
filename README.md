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
yarn add @sebastianwessel/quickjs
```

or

```sh
bun add @sebastianwessel/quickjs
```

## Usage

Here's a simple example of how to use the package:

```typescript
import { QuickJSSandbox } from '@sebastianwessel/quickjs';

const sandbox = new QuickJSSandbox();

const result = sandbox.execute(`
  const add = (a, b) => a + b;
  add(2, 3);
`);

console.log(result); // Outputs: 5
```

## License

This project is licensed under the MIT License.

---

This package is ideal for developers looking to execute JavaScript code securely within a TypeScript application, ensuring both performance and safety with the QuickJS WebAssembly sandbox.