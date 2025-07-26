---
title: Typescript Code
description: Execute Typescript code in the QuickJS sandbox
order: 70
---

## Execute TypeScript in the Sandbox

Executing TypeScript in the sandboxed runtime, is similar to executing JavaScript. An additional transpile step will be applied to the given code. Additionally each file below `/src` with file extension`.ts` in the custom file system will be transpiled.

The TypeScript code is only transpiled, but not type-checked!
If checking types is required, it should be done and handled, before using this library.

**Requirements:**

- optional dependency package `typescript` must be installed on the host system
- Sandbox option `transformTypescript` must be set to `true`

Example:

```typescript
import { loadQuickJs } from "@sebastianwessel/quickjs";
import variant from "@jitl/quickjs-ng-wasmfile-release-sync";

const { runSandboxed } = await loadQuickJs(variant);

const options: SandboxOptions = {
  transformTypescript: true, // [!code ++] enable typescript support
  mountFs: {
    src: {
      "test.ts": `export const testFn = (value: string): string => {
                    console.log(value)
                    return value
                  }`,
    },
  },
};

const result = await runSandboxed(
  async ({ evalCode }) =>
    evalCode(`
  import { testFn } from './test.js'

const t = (value:string):number=>value.length

console.log(t('abc'))

export default testFn('hello')
`),
  options,
);

console.log(result); // { ok: true, data: 'hello' }
// console log on host:
// 3
// hello
```

## Browser

The Typescript package will be imported automatically when it is required. The import defaults to `typescript`, which is expected in a backend environment.
The import can be changed in the [Runtime Options](./runtime-options.md) via the `typescriptImportFile` option.

## Compiler Options

For most use cases, the default compiler options should fit the requirements.

```ts
const compilerOptions: TS.CompilerOptions = {
  module: 99, // ESNext
  target: 99, // ES2023
  allowJs: true,
  skipLibCheck: true,
  esModuleInterop: true,
  strict: false,
  allowSyntheticDefaultImports: true,
  ...options,
};
```

If there is a need to use custom settings, please see section `transformCompilerOptions` in [Runtime Options](./runtime-options.md).
