---
title: Path Normalizer
description: Learn how to figure out the real location of a requested import file
order: 4010
---

# Understanding Path Normalization in QuickJS

When working with **QuickJS**, one of the most crucial components in the sandbox environment is the **Path Normalizer**.  

Path normalization plays a key role in **resolving module imports**, ensuring that dependencies are correctly loaded—whether they are **local files, remote dependencies, or Node.js modules**.  

In this article, we’ll explore:  

✅ **What path normalization is**  
✅ **Why it’s important in QuickJS**  
✅ **How to implement a custom path normalizer**  

## 🏗️ What is Path Normalization?  

In JavaScript, **modules are imported using file paths**, such as:

- **Relative paths** (`./module.js`, `../utils.js`)  
- **Absolute paths** (`/src/module.js`)  
- **Node.js built-in modules** (`node:path`, `node:fs`)  
- **Remote URLs** (e.g., `https://esm.sh/react`)  

However, in a **sandboxed environment like QuickJS**, module imports **must be carefully managed** because:  
1️⃣ **There is no direct file system access.**  
2️⃣ **Modules might come from different sources (local, remote, or Node core).**  
3️⃣ **QuickJS does not automatically resolve paths like Node.js does.**  

A **Path Normalizer** is responsible for **mapping the requested module path** to the correct **source location**, ensuring that imports work correctly.  

## ⚙️ Implementing a Path Normalizer in QuickJS  

To handle different types of imports, we need to **intercept the import statements** and transform paths accordingly.  

Let’s break this down step by step.  

### 📝 **Basic Rules for Path Normalization**  

| Type of Import | Transformation |
|---------------|---------------|
| **Remote URL (esm.sh)** | Convert `esm.sh/react` → `https://esm.sh/react` |
| **Node.js Modules** | Convert `node:path` → `/node_modules/path` |
| **Relative Imports (Local)** | Convert `./module.js` → Absolute path in virtual FS |
| **Relative Imports (esm.sh)** | Convert `/submodule` inside an esm.sh module to full URL |

### 🔹 **Custom Path Normalizer Implementation**  

The following **path normalizer function** ensures that all imports are properly mapped:  

```ts
const modulePathNormalizer = async (baseName: string, requestedName: string) => {
  // Import from esm.sh
  if (requestedName.startsWith('esm.sh')) {
    return `https://${requestedName}`
  }

  if (requestedName.startsWith('https://esm.sh')) {
    return requestedName
  }

  // Import within an esm.sh module
  if (requestedName.startsWith('/')) {
    return `https://esm.sh${requestedName}`
  }

  // Handle relative imports
  if (requestedName.startsWith('.')) {
    // If base is an esm.sh module, resolve the full URL
    if (baseName.startsWith('https://esm.sh')) {
      return new URL(requestedName, baseName).toString()
    }

    // Resolve relative paths for local imports
    const parts = baseName.split('/')
    parts.pop()
    return resolve(`/${parts.join('/')}`, requestedName)
  }

  // Normalize Node.js module imports
  const moduleName = requestedName.replace('node:', '')
  return join('/node_modules', moduleName)
}
```

## 🔄 Using the Path Normalizer in a QuickJS Sandbox  

Once we have our **path normalizer**, we need to **integrate it into our QuickJS execution environment**.

```ts
import { type SandboxAsyncOptions, loadAsyncQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadAsyncQuickJs()

const options: SandboxAsyncOptions = {
  modulePathNormalizer,
}

const code = `
import * as React from 'esm.sh/react@15'
export default React.createElement('div', null, 'Hello, QuickJS!')
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result)
// Output: "<div>Hello, QuickJS!</div>"
```

✅ **All imports are automatically resolved** by our **Path Normalizer**.  

## 🛠️ Enhancing the Path Normalizer  

While the current implementation covers **basic scenarios**, we can further enhance it by:  

1️⃣ **Caching resolved paths** to improve performance.  
2️⃣ **Handling multiple CDN sources (e.g., skypack, jsdelivr).**  
3️⃣ **Restricting certain imports** for security reasons.  
4️⃣ **Adding logging/debugging for better visibility.**  

Example **logging enhancement**:

```ts
console.log(`Resolving module: ${requestedName} → ${normalizedPath}`)
```

## 🎯 Key Takeaways  

✅ **Path normalization ensures correct module resolution in QuickJS.**  
✅ **It allows seamless integration of remote and local dependencies.**  
✅ **A well-designed normalizer enhances security and performance.**  

By implementing **a robust path normalizer**, we can enable **smooth and safe execution of JavaScript modules** within a **QuickJS sandboxed environment**.
