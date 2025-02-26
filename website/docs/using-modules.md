---
title: Using Modules
description: Learn, how you can provide your own custom node modules to the QuickJS runtime
order: 40
---

# Using Modules

JavaScript and Typescript code often relies on modules, which provide functionality. In general, it is possible to use modules in a regular manner by using the `import` statement.

This library comes with a set of modules, which are intend to be Node.js API compatible as much as possible. But there is no 100% compatibility. Especially, not the full set of modules is available. Please see [Node Compatibility](./node-compatibility.md) for more information.

## Module Loader

The standard runtime does not support module loading in an asynchronous manner. This means, in the module loader, asynchronous functions like `fetch` are not available.

This means, usage of dynamic imports during the runtime - eg. from [esm.sh](https://esm.sh/) or similar - are not possible.

Furthermore, the standard module loader is a simple implementation, which reads the modules, which needed to be loaded into the virtual file system..

### Limitations

- Modules do not have access to native functions.
- Modules must be plain JavaScript.
- Relative imports within one module are not supported (though they can still import other modules).
- `package.json` file is not used:
  - Finding the root file via a package.json is not supported.
  - Module (sub-)dependencies are not automatically installed/handled
  - Modules with multiple exports in `package.json` must be handled manually
- Only a small subset of Node.js core modules is available, so not every module will work out of the box.

All this means, modules must be present upfront. Also, the module file structure must be simple.

## Custom Node Modules

This library allows the use of custom Node.js packages within the QuickJS runtime. Node modules are loaded into a virtual file system, which is then exposed to the client system. This ensures complete isolation from the underlying host system.

### Preparing a Custom Module

To work around some of these limitations, the custom Node.js module should be a single ESM file, including all dependencies (except Node.js core modules).

Tools like [Bun](https://bun.sh) and [esbuild](https://esbuild.github.io) make this process easy for many modules.

#### Bun

Bun is used in the development of this library. Working examples are available in the repository.

To create a bundled module as a single file with dependencies, you need an entry file:

```typescript
// entry.ts

// Import the module or functionality to bundle
import { expect } from 'chai';

// Optional custom code

export { expect };
```

Here, only the `expect` part gets bundled, but you can also use `export * from 'chai'` to include everything.

A configuration file is recommended to repeat the build step easily:

```typescript
// build.ts
const testRunnerResult = await Bun.build({
  entrypoints: ['./entry.ts'],
  format: 'esm',
  minify: true,
  outdir: './vendor'
});
```

Build the custom module file with `bun ./build.ts`. The generated file should be in `./vendor`.

For more information, visit the [official Bun website](https://bun.sh/docs/bundler).

#### Esbuild

Using esbuild works similarly to Bun. An entry file is required, and a config file is recommended.

The entry file will be the same as for Bun. The config file needs to be adapted (with a `.mjs` extension):

```typescript
// build.mjs
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./entry.ts'],
  bundle: true,
  outfile: './vendor/my-package.js',
});
```

Build the custom module file with `node ./build.mjs`. The generated file should be in `./vendor`.

For more information, visit the [official esbuild website](https://esbuild.github.io/getting-started/).

### Using a Custom Module

A virtual file system is used to provide Node.js modules to the client system. To provide custom modules, a nested structure is used.

The root key is the package name, and the child key represents the index file, which should be `index.js` by default. The custom module itself is provided as a raw string.

Example:

```typescript
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs';

// General setup, such as loading and initializing the QuickJS WASM
// This is a resource-intensive job and should be done only once if possible
const { runSandboxed } = await loadQuickJs()

const __dirname = dirname(fileURLToPath(import.meta.url));
const customModuleHostLocation = join(__dirname, './custom.js');

const options:SandboxOptions = {
  nodeModules: {
    // Module name
    'custom-module': {
      // Key must be index.js, value is the file content of the module
      'index.js': await Bun.file(customModuleHostLocation).text(),
    },
  },
};

const code = `
import { customFn } from 'custom-module';

const result = customFn();

console.log(result);

export default result;
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code, undefined, options), options)


console.log(result); // { ok: true, data: 'Hello from the custom module' }
```
