---
title: Code in the Sandbox
description: Compile and execute javascript or typescript code in the sandbox
order: 20
---

# Code in the Sandbox

## Execute JavaScript in the Sandbox

The most common use case is, to execute a give JavaScript code in the QuickJS webassembly sandbox.
The `evalCode` function described below, is intend to be used, when a given JavaScript code should be executed and optional a result value is returned.
It is recommended, to always return a value, for better validation on the host side, that the code was executed as expected.

In the sandbox, the executed code "lives" in `/src/index.js`. If custom files are added via configuration, source files should be placed below `/src`. Nested directories are supported.

```typescript
import { type SandboxOptions, loadQuickJs } from "@sebastianwessel/quickjs";
import variant from "@jitl/quickjs-ng-wasmfile-release-sync";

const { runSandboxed } = await loadQuickJs(variant);

const options: SandboxOptions = {
  allowFetch: true, // inject fetch and allow the code to fetch data
  allowFs: true, // mount a virtual file system and provide node:fs module
  env: {
    MY_ENV_VAR: "env var value",
  },
};

const code = `
import { join } as path from 'path'

const fn = async ()=>{
  console.log(join('src','dist')) // logs "src/dist" on host system

  console.log(env.MY_ENV_VAR) // logs "env var value" on host system

  const url = new URL('https://example.com')

  const f = await fetch(url)

  return f.text()
}

export default await fn()
`;
const result = await runSandboxed(
  async ({ evalCode }) => evalCode(code),
  options,
);

console.log(result); // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
```

The `evalCode` functions returns a unified result object, and does not throw.

For further information, it is hight recommended to [read "Basic Understanding"](./basic-understanding.md).

## Only Validation Check of the Code

There are use cases, where the given JavaScript code should not be executed, but validated for technical correctness.
To only test the code, without executing the code, the function `validateCode` should be used.

```typescript
import { loadQuickJs } from "@sebastianwessel/quickjs";
import variant from "@jitl/quickjs-ng-wasmfile-release-sync";

const { runSandboxed } = await loadQuickJs(variant);

const code = `
  const value ='missing string end
  export default value
`;

const result = await runSandboxed(async ({ validateCode }) =>
  validateCode(code),
);

console.log(result);
//{
//  ok: false,
//  error: {
//  message: 'unexpected end of string',
//  name: 'SyntaxError',
//  stack: '    at /src/index.js:2:1\n',
//  },
//  isSyntaxError: true,
//}
```

The `validateCode` functions returns a unified result object, and does not throw.

For further information, it is hight recommended to [read "Basic Understanding"](./basic-understanding.md).
