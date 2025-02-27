---
title: Using Modules
description: Learn, how you can provide your own custom node modules to the QuickJS runtime
order: 40
---

# Using Modules

JavaScript and TypeScript code often relies on modules to provide functionality. In general, modules can be used normally with the `import` statement.

This library includes a set of modules intended to be as compatible as possible with the Node.js API. However, full compatibility is not guaranteed. In particular, not all Node.js modules are available. For more details, see [Node Compatibility](./node-compatibility.md).

## Path Normalizer

The path normalizer determines the location of a module to be imported.

It takes two input parameters:  
1. The location of the file containing the import statement.  
2. The requested import path.  

This allows it to resolve relative paths and rewrite imports as needed.

The normalized path is then passed as input to the module loader.

## Module Loaders

Module loaders are responsible for retrieving the content (source code) of an imported module.

### Default (Synchronous)

The standard runtime does not support asynchronous module loading. This means that asynchronous functions like `fetch` cannot be used within the module loader.

As a result, dynamic imports at runtime—e.g., from [esm.sh](https://esm.sh/) or similar services—are not possible.

Additionally, the standard module loader is a simple implementation that reads modules from the virtual file system.

#### Limitations

- Modules do not have access to native functions.
- Modules must be plain JavaScript.
- Relative imports within a single module are not supported (though modules can still import other modules).
- The `package.json` file is not used:
  - Determining the root file via `package.json` is not supported.
  - Module (sub-)dependencies are not automatically installed or handled.
  - Modules with multiple exports defined in `package.json` must be managed manually.
- Only a small subset of Node.js core modules is available, so not every module will work out of the box.

These limitations mean that all required modules must be available beforehand, and the module file structure must be straightforward.

### Asynchronous

This library supports asynchronous module loading — see [github.com/justjake/quickjs-emscripten](https://github.com/justjake/quickjs-emscripten?tab=readme-ov-file#asyncify).

The asynchronous variant allows the module loader to function asynchronously, enabling dynamic dependency loading at runtime from sources such as [esm.sh](https://esm.sh/) or similar services.
