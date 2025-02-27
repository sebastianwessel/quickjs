---
title: File System
description: Learn, how you can create and mount your own virtual file system into the QuickJS runtime
order: 50
---

# Custom File System

Every QuickJS sandbox has its own virtual file system. The file system is based on [memfs](https://github.com/streamich/memfs). It holds the `node_modules` and allows for the inclusion of custom files in the script running in the QuickJS sandbox.

For detailed information on providing a custom node module, please refer to the documentation: [Custom Node Modules](./module-resolution/custom-modules.md).

The code provided to the `evalCode` function is treated as file `src/index.js`. This means when you use relative files, they are relative to `src/index.js`.

## Providing Files

To provide a custom file system, a nested structure is used. The structure is mounted below `/`.

### Example

```typescript
const options:SandboxOptions = {
  mountFs: {
    src: {
      'custom.js': `export const relativeImportFunction = ()=>'Hello from relative import function'`,
    },
    'fileInRoot.txt': 'Some text content'
  },
};
```

In this example, a JavaScript file is added to the virtual file system at `/src/custom.js`, and a text file is added to the root `/fileInRoot.txt`.

## Importing Files

JavaScript files can be imported as usual. Importing files is possible even if the [runtime option](./runtime-options.md) `allowFs` is set to `false`. This option only refers to the functions and methods of the `fs` package. Regular js imports are not effected.

This means, the provided js file from the example above, can be used like this:

```js
import { customFn } from './custom.js'

// [...]
```

## Direct File Access

To use file handling methods from `node:fs`, the [runtime option](./runtime-options.md) `allowFs` must be set to `true`. If `allowFs` is not enabled, every method from `node:fs` will throw an error. For security reasons, the `allowFs` option is set to `false` by default.

Currently, only basic file operations on text files are supported. For more information, see [Node compatibility - node:fs](module-resolution/node-compatibility.md).
