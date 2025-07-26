---
title: Sync Module Loader
description: Learn how to figure out the real location of a requested import file
order: 4020
---

# Understanding the Synchronous Module Loader in QuickJS

When running JavaScript in a **sandboxed environment**, one of the biggest challenges is **handling module imports**.

In **Node.js**, modules are resolved using a complex system of:

- **File-based resolution** (`./module.js`, `../utils.js`)
- **Package-based resolution** (`import fs from 'fs'`)
- **Index files in directories** (`index.js`)

However, **QuickJS does not natively support module resolution**. To enable **synchronous module loading**, we need a **custom module loader** that:

✅ **Finds modules in a virtual file system**
✅ **Handles missing file extensions (`.js`)**
✅ **Supports directory-based resolution (`index.js`)**
✅ **Provides `import.meta.url` replacements**

In this article, we’ll explore how **the default synchronous module loader works**, how to use it, and how it can be customized. 🚀

---

## 🏗️ How Module Loading Works in QuickJS

QuickJS executes JavaScript inside a **lightweight WebAssembly runtime**, which means **module resolution does not happen automatically**.

Instead, **we must manually load module contents** from a **virtual file system** (based on `memfs`).

### 🔍 **How Does the Module Loader Work?**

When a script imports a module:

1️⃣ **Check if the file exists** → If not, try adding `.js`.
2️⃣ **If it’s a folder** → Look for an `index.js` file.
3️⃣ **Read the file contents** → If successful, return the code as a string.
4️⃣ **Replace `import.meta.url`** → Since QuickJS does not support it natively.
5️⃣ **Return an error if the module is not found.**

---

## ⚙️ The Default Synchronous Module Loader

Let’s dive into the **default implementation**:

```ts
import type { IFs } from "memfs";
import type { JSModuleLoader } from "quickjs-emscripten-core";
import { join } from "node:path";
import type { RuntimeOptions } from "../../types/RuntimeOptions.js";

export const getModuleLoader = (fs: IFs, _runtimeOptions: RuntimeOptions) => {
  const moduleLoader: JSModuleLoader = (inputName, _context) => {
    let name = inputName;

    // 🔹 Check if the module exists
    if (!fs.existsSync(name)) {
      // 🔹 Try adding ".js" if missing
      if (fs.existsSync(`${name}.js`)) {
        name = `${name}.js`;
      } else {
        return {
          error: new Error(`Module '${inputName}' not installed or available`),
        };
      }
    }

    // 🔹 Handle directory imports (look for index.js)
    if (fs.lstatSync(name).isDirectory()) {
      name = join(name, "index.js");
      if (!fs.existsSync(name)) {
        return {
          error: new Error(`Module '${inputName}' not installed or available`),
        };
      }
    }

    // 🔹 Read the module file and replace import.meta.url
    const value = fs
      .readFileSync(name)
      ?.toString()
      .replaceAll("import.meta.url", `'file://${name}'`);

    if (!value) {
      return {
        error: new Error(`Module '${name}' not installed or available`),
      };
    }

    return { value };
  };

  return moduleLoader;
};
```

---

## 🔍 Breaking Down the Implementation

### 1️⃣ **Handling Missing Files & Extensions**

Many times, module imports are written **without the `.js` extension**. The loader **checks if the file exists**, and if not, **it tries appending `.js`**.

```ts
if (!fs.existsSync(name)) {
  if (fs.existsSync(`${name}.js`)) {
    name = `${name}.js`;
  } else {
    return {
      error: new Error(`Module '${inputName}' not installed or available`),
    };
  }
}
```

✅ **This allows us to import modules without specifying `.js`.**

```js
import "./utils"; // ✅ Works, even though file is "utils.js"
```

---

### 2️⃣ **Handling Directory-Based Modules**

In **Node.js**, if you import a **directory**, it tries to load `index.js`.

```ts
if (fs.lstatSync(name).isDirectory()) {
  name = join(name, "index.js");
  if (!fs.existsSync(name)) {
    return {
      error: new Error(`Module '${inputName}' not installed or available`),
    };
  }
}
```

✅ **Now, we can import folders just like Node.js:**

```js
import "./components"; // ✅ Automatically resolves "components/index.js"
```

---

### 3️⃣ **Fixing `import.meta.url`**

In **Node.js**, `import.meta.url` gives the absolute file path of the module.

Since QuickJS **does not support `import.meta.url`**, we **replace it dynamically**:

```ts
const value = fs
  .readFileSync(name)
  ?.toString()
  .replaceAll("import.meta.url", `'file://${name}'`);
```

✅ This ensures `import.meta.url` **works as expected** in QuickJS.

```js
console.log(import.meta.url);
// ✅ Logs "file:///src/utils.js"
```

---

## 🚀 Using the Module Loader in QuickJS

To use this **module loader** inside a **QuickJS sandbox**, we pass it to the `SandboxOptions`:

```ts
import { type SandboxOptions, loadQuickJs } from "@sebastianwessel/quickjs";
import { getModuleLoader } from "./moduleLoader.js";
import { vol } from "memfs";
import variant from "@jitl/quickjs-ng-wasmfile-release-sync";

const options: SandboxOptions = {
  allowFs: true,
  mountFs: vol.fromJSON({
    "/src/utils.js": `export const greet = () => 'Hello, QuickJS!'`,
  }),
  getModuleLoader,
};

const { runSandboxed } = await loadQuickJs(variant);

const code = `
import { greet } from './src/utils.js'
export default greet()
`;

const result = await runSandboxed(
  async ({ evalCode }) => evalCode(code),
  options,
);
console.log(result); // Output: "Hello, QuickJS!"
```

✅ **Modules are now resolved synchronously, just like in Node.js!**

---

## 🎯 Key Takeaways

✅ **QuickJS does not support built-in module resolution - so we must implement a custom loader.**
✅ **The default loader:**

- **Resolves missing file extensions (`.js`).**
- **Handles directory-based imports (`index.js`).**
- **Replaces `import.meta.url` dynamically.**
  ✅ **This allows QuickJS to behave similarly to a Node.js module system — without requiring a full Node environment.**

By implementing this **synchronous module loader**, we can safely and efficiently execute **modular JavaScript** inside **a sandboxed WebAssembly runtime**.
