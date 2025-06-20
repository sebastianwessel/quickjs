---
title: Runtime Options
description: The QuickJS sandbox provides a wide range of options to align the runtime to your needs
order: 40
---

# QuickJS Sandbox Options

The **QuickJS Sandbox** provides a secure, configurable environment for executing JavaScript and TypeScript code. The sandbox supports both **synchronous** and **asynchronous** WebAssembly execution, with various options for resource limits, virtual file systems, networking, logging, and more.

## ⚙️ Base Options

These options apply to both synchronous and asynchronous sandbox instances.

### ⏳ Execution Limits

| Option | Type | Description |
|--------|------|-------------|
| `executionTimeout` | `number` | Maximum script execution time (in milliseconds). Set to `0` for unlimited. |
| `maxStackSize` | `number` | Maximum stack size (in bytes). Set to `0` to disable the limit. |
| `memoryLimit` | `number` | Maximum memory allocation. Set to `0` to remove the limit. |

### 📂 Virtual File System

| Option | Type | Description |
|--------|------|-------------|
| `mountFs` | `NestedDirectoryJSON | IFs` | Mounts a virtual file system using [memfs](https://github.com/streamich/memfs). |
| `nodeModules` | `NestedDirectoryJSON` | Mounts custom `node_modules` in the virtual file system. |

### 📄 File System Access

| Option | Type | Description |
|--------|------|-------------|
| `allowFs` | `boolean` | Enables file system access (`node:fs`). |

### 🌐 Networking

| Option | Type | Description |
|--------|------|-------------|
| `allowFetch` | `boolean` | Enables `fetch` for making HTTP(S) calls. |
| `fetchAdapter` | `typeof fetch` | Custom fetch adapter provided as a host function. |

### 🛠️ Testing Utilities

| Option | Type | Description |
|--------|------|-------------|
| `enableTestUtils` | `boolean` | Enables test frameworks (`chai` & `mocha`). |

### 📢 Console Customization

You can override console methods for custom logging behavior.

```ts
console: {
  log?: (message?: unknown, ...params: unknown[]) => void;
  error?: (message?: unknown, ...params: unknown[]) => void;
  warn?: (message?: unknown, ...params: unknown[]) => void;
  info?: (message?: unknown, ...params: unknown[]) => void;
  debug?: (message?: unknown, ...params: unknown[]) => void;
}
```

### 🛑 Environment & Syncing

| Option | Type | Description |
|--------|------|-------------|
| `env` | `Record<string, unknown>` | Defines environment variables available inside QuickJS. |
| `dangerousSync` | `Record<string, unknown>` | Syncs data between host & guest (⚠️ can be modified by guest). |

### 📝 TypeScript Support

| Option | Type | Description |
|--------|------|-------------|
| `typescriptImportFile` | `string` | TypeScript library to import (default: `typescript`). |
| `transformTypescript` | `boolean` | Transpiles TypeScript files to JavaScript in `mountFs`. |
| `transformCompilerOptions` | `TS.CompilerOptions` | TypeScript compiler options. |

### ⏲️ Timer Limits

To prevent abuse, the number of running `setTimeout` and `setInterval` calls is restricted.

| Option | Type | Description |
|--------|------|-------------|
| `maxTimeoutCount` | `number` | Max concurrent timeouts (default: `10`). |
| `maxIntervalCount` | `number` | Max concurrent intervals (default: `10`). |

---

## 🏗️ Module Handling

Both **synchronous** and **asynchronous** QuickJS sandboxes allow customizing module loading.

### 📦 Synchronous Module Options (`SandboxOptions`)

| Option | Type | Description |
|--------|------|-------------|
| `getModuleLoader` | `(fs: IFs, options: RuntimeOptions) => JSModuleLoader` | Custom module loader. |
| `modulePathNormalizer` | `JSModuleNormalizer` | Transforms module paths before loading. |

### 🌍 Asynchronous Module Options (`SandboxAsyncOptions`)

| Option | Type | Description |
|--------|------|-------------|
| `getModuleLoader` | `(fs: IFs, options: RuntimeOptions) => JSModuleLoaderAsync` | Custom module loader. |
| `modulePathNormalizer` | `JSModuleNormalizerAsync` | Transforms module paths before loading. |

🔗 **More info:** See [github.com/justjake/quickjs-emscripten](https://github.com/justjake/quickjs-emscripten?tab=readme-ov-file#asyncify) for details on asynchronous execution.

## Example Usage

The options are passed to the `runSandboxed` function. Here is a basic example:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

// Create a runtime instance each time a JS code should be executed
const options:SandboxOptions = {
  allowFetch: true, // inject fetch and allow the code to fetch data
  allowFs: true,    // mount a virtual file system and provide node:fs module
  env: {
    MY_ENV_VAR: 'env var value'
  },
  console: {
    log: (message, ...optionalParams) => {
      console.log(`[QuickJS Log]: ${message}`, ...optionalParams);
    },
    error: (message, ...optionalParams) => {
      console.error(`[QuickJS Error]: ${message}`, ...optionalParams);
    }
    // Customize other console methods as needed
  }
};

const code = `
import { join } as path from 'path';

const fn = async () => {
  console.log(join('src', 'dist')); // logs "src/dist" on host system

  console.log(env.MY_ENV_VAR); // logs "env var value" on host system

  const url = new URL('https://example.com');

  const f = await fetch(url);

  return f.text();
}

export default await fn();
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result); // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
```
