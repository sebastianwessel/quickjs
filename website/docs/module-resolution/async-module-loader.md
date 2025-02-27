---
title: Async Module Loader
description: Learn how to figure out the real location of a requested import file
order: 4030
---

# Implementing an Asynchronous Module Loader in QuickJS  

When working with **QuickJS**, executing JavaScript modules inside a **sandboxed environment** presents a challenge:  

✅ **Modules need to be dynamically loaded**—especially when fetching remote dependencies.  
✅ **Some dependencies might not be available upfront**—they must be fetched at runtime.  
✅ **Using synchronous module resolution can block execution**—asynchronous loading is more efficient.  

The **default module loader in QuickJS** works **synchronously**, meaning all modules must be **preloaded** into the virtual file system.  

However, what if we want to:  

- Load modules **from external sources like [esm.sh](https://esm.sh)**?  
- Dynamically fetch modules **during execution**?  
- Implement **server-side rendering (SSR)** for JavaScript frameworks like **React**?  

The answer: **An Asynchronous Module Loader.** 🚀  

## 🏗️ Why Use an Asynchronous Module Loader?  

### 🔹 Synchronous vs. Asynchronous Loading  

| **Feature** | **Synchronous Loader** | **Asynchronous Loader** |
|------------|-----------------|-----------------|
| **Module Availability** | Must exist before execution | Can be fetched dynamically |
| **Performance** | Blocks execution while reading | Non-blocking, better for large apps |
| **External Dependencies** | Difficult to support | Can load from CDNs like esm.sh |
| **Use Case** | Small apps, static files | Server-side rendering, remote modules |

💡 **Asynchronous module loading** is **essential** when working with **dynamic environments**—such as **SSR, AI-generated code execution, and external API calls.**  

## 🔄 Implementing an Asynchronous Module Loader  

We’ll implement a **custom async loader** that:  

✅ **Handles local modules from the virtual file system**  
✅ **Supports remote module fetching from esm.sh**  
✅ **Resolves relative imports within remote modules**  

### 🔹 **Step 1: Path Normalization for Async Modules**  

We need to **ensure that module paths are correctly resolved** before loading them asynchronously.  

```ts
const modulePathNormalizer = async (baseName: string, requestedName: string) => {
  // Fetch from esm.sh
  if (requestedName.startsWith('esm.sh') || requestedName.startsWith('https://esm.sh')) {
    return requestedName.startsWith('https://') ? requestedName : `https://${requestedName}`
  }

  // Relative imports within esm.sh modules
  if (requestedName.startsWith('/')) {
    return `https://esm.sh${requestedName}`
  }

  // Handle relative imports from local sources
  if (requestedName.startsWith('.')) {
    if (baseName.startsWith('https://esm.sh')) {
      return new URL(requestedName, baseName).toString()
    }
    return resolve(`/${baseName.split('/').slice(0, -1).join('/')}`, requestedName)
  }

  // Normalize Node.js built-in modules
  const moduleName = requestedName.replace('node:', '')
  return join('/node_modules', moduleName)
}
```

### 🔹 **Step 2: Fetching Modules Asynchronously**  

Since QuickJS **does not automatically fetch remote modules**, we need to **define an async loader**:  

```ts
import type { QuickJSAsyncContext } from 'quickjs-emscripten-core'
import { getAsyncModuleLoader } from 'quickjs-emscripten-core'

const getModuleLoader = (fs, runtimeOptions) => {
  const defaultLoader = getAsyncModuleLoader(fs, runtimeOptions)

  const loader = async (moduleName: string, context: QuickJSAsyncContext) => {
    console.log('Fetching module:', moduleName)

    // Load from local filesystem first
    if (!moduleName.startsWith('https://esm.sh')) {
      return defaultLoader(moduleName, context)
    }

    // Fetch from esm.sh
    const response = await fetch(moduleName)
    if (!response.ok) {
      throw new Error(`Failed to load module ${moduleName}`)
    }

    return await response.text()
  }

  return loader
}
```

✅ **This implementation enables QuickJS to fetch modules dynamically from esm.sh!**  

### 🔹 **Step 3: Running Async Code with QuickJS**  

Now, let’s **execute an SSR example**, fetching React and rendering HTML dynamically.

```ts
import { type SandboxAsyncOptions, loadAsyncQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadAsyncQuickJs()

const options: SandboxAsyncOptions = {
  modulePathNormalizer,
  getModuleLoader,
}

const code = `
import * as React from 'esm.sh/react@18'
import * as ReactDOMServer from 'esm.sh/react-dom@18/server'

const e = React.createElement
export default ReactDOMServer.renderToStaticMarkup(
  e('div', null, e('strong', null, 'Hello world!'))
)
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result)
// Output: "<div><strong>Hello world!</strong></div>"
```


## 🎯 Key Takeaways  

✅ **Synchronous module loading is limited**—all modules must be preloaded.  
✅ **Asynchronous module loaders enable dynamic imports**, making QuickJS more powerful.  
✅ **With an async loader, we can fetch modules from sources like esm.sh** at runtime.  
✅ **This approach is ideal for SSR, AI-generated code execution, and dynamic environments.**  

## 🔗 Next Steps  

🛠️ **Try it out!** Modify the loader to fetch modules from different CDNs.  
🔍 **Optimize performance**—cache fetched modules for faster execution.  
🚀 **Extend support**—enable async module loading for larger applications.  

QuickJS **makes secure and efficient JavaScript execution possible—now with dynamic imports!** 
