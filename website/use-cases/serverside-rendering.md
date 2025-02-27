---
title: Serverside Rendering (SSR)
description: Use QuickJS for serverside rendering
image: /use-case-ssr.jpg
order: 30
---

# Server-Side Rendering (SSR)

Server-Side Rendering (SSR) is a **powerful technique** for improving performance, SEO, and user experience in web applications. It enables **pre-rendering** of React components on the server, delivering a **fully-formed HTML response** to the client—before any JavaScript is executed in the browser.  

Traditionally, SSR relies on **Node.js** and frameworks like **Next.js**, but what if we want an **isolated, lightweight, and secure** SSR environment?  

Enter **QuickJS**. 🚀  

With **QuickJS WebAssembly**, we can **execute JavaScript on the server in a sandboxed environment** without the overhead of a full Node.js process. This allows us to:  

✅ **Render React components dynamically** on the backend.  
✅ **Keep execution isolated and secure**.  
✅ **Load dependencies dynamically** from sources like [esm.sh](https://esm.sh).  
✅ **Run SSR in environments where Node.js isn't available**.  

Let’s explore how to set up **Server-Side Rendering with QuickJS**.  

## 🏗️ Setting Up QuickJS for SSR  

To render React components on the server using QuickJS, we need to:  

1️⃣ **Load React and ReactDOMServer** dynamically.  
2️⃣ **Execute the rendering process inside a sandboxed environment**.  
3️⃣ **Retrieve the final HTML output** and return it to the client.  

### 🔹 **Step 1: Configuring the Sandbox**  

We need to configure **module resolution** so that QuickJS can import React and ReactDOMServer dynamically. Since we are not running a full Node.js environment, we will **fetch dependencies from [esm.sh](https://esm.sh)**, a CDN for JavaScript modules.  

Here’s how we **normalize module paths** to support: 

- **Relative imports**  
- **Absolute imports from esm.sh**  
- **Node.js module replacements**  

```ts
const modulePathNormalizer = async (baseName: string, requestedName: string) => {
  // Import directly from esm.sh
  if (requestedName.startsWith('esm.sh') || requestedName.startsWith('https://esm.sh')) {
    return requestedName.startsWith('https://') ? requestedName : `https://${requestedName}`
  }

  // Resolve relative imports from esm.sh
  if (requestedName.startsWith('/')) {
    return `https://esm.sh${requestedName}`
  }

  // Handle relative imports in local files
  if (requestedName.startsWith('.')) {
    if (baseName.startsWith('https://esm.sh')) {
      return new URL(requestedName, baseName).toString()
    }
    return resolve(`/${baseName.split('/').slice(0, -1).join('/')}`, requestedName)
  }

  // Normalize Node.js module imports
  const moduleName = requestedName.replace('node:', '')
  return join('/node_modules', moduleName)
}
```

### 🔹 **Step 2: Custom Module Loader**  

Since QuickJS does not provide native module resolution, we must **fetch JavaScript modules on-demand** using a **custom module loader**.  

This loader intercepts module imports and:  
✅ **Loads modules from esm.sh**.  
✅ **Falls back to the default QuickJS loader** for local modules.  
✅ **Handles errors if a module fails to load**.  

```ts
const getModuleLoader = (fs, runtimeOptions) => {
  const defaultLoader = getAsyncModuleLoader(fs, runtimeOptions)

  const loader = async (moduleName: string, context: QuickJSAsyncContext) => {
    console.log('Fetching module:', moduleName)

    if (!moduleName.startsWith('https://esm.sh')) {
      return defaultLoader(moduleName, context)
    }

    const response = await fetch(moduleName)
    if (!response.ok) {
      throw new Error(`Failed to load module ${moduleName}`)
    }

    return await response.text()
  }

  return loader
}
```

### 🔹 **Step 3: Running the SSR Code**  

With our **sandbox configured**, we can now **run server-side React rendering inside QuickJS**.  

#### 📌 React Code to Render (Running Inside the Sandbox)

```ts
const code = `
import * as React from 'esm.sh/react@15'
import * as ReactDOMServer from 'esm.sh/react-dom@15/server'

const e = React.createElement
export default ReactDOMServer.renderToStaticMarkup(
  e('div', null, e('strong', null, 'Hello world!'))
)
`
```

#### 🏃 Executing the Code in QuickJS

```ts
import { type SandboxAsyncOptions, loadAsyncQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadAsyncQuickJs()

const options: SandboxAsyncOptions = {
  modulePathNormalizer,
  getModuleLoader,
}

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result)
// Output: "<div><strong>Hello world!</strong></div>"
```

🔥 **Success!** Our server-side React component is rendered as static HTML.  

## 🏁 Putting It All Together  

### 📌 Full SSR Workflow with QuickJS  

```ts
import { join, resolve } from 'node:path'
import type { QuickJSAsyncContext } from 'quickjs-emscripten-core'
import { type SandboxAsyncOptions, getAsyncModuleLoader, loadAsyncQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadAsyncQuickJs()

// Normalize module paths
const modulePathNormalizer = async (baseName: string, requestedName: string) => {
  if (requestedName.startsWith('esm.sh') || requestedName.startsWith('https://esm.sh')) {
    return requestedName.startsWith('https://') ? requestedName : `https://${requestedName}`
  }

  if (requestedName.startsWith('/')) {
    return `https://esm.sh${requestedName}`
  }

  if (requestedName.startsWith('.')) {
    if (baseName.startsWith('https://esm.sh')) {
      return new URL(requestedName, baseName).toString()
    }
    return resolve(`/${baseName.split('/').slice(0, -1).join('/')}`, requestedName)
  }

  const moduleName = requestedName.replace('node:', '')
  return join('/node_modules', moduleName)
}

// Custom module loader
const getModuleLoader = (fs, runtimeOptions) => {
  const defaultLoader = getAsyncModuleLoader(fs, runtimeOptions)

  return async (moduleName: string, context: QuickJSAsyncContext) => {
    console.log('Fetching module:', moduleName)

    if (!moduleName.startsWith('https://esm.sh')) {
      return defaultLoader(moduleName, context)
    }

    const response = await fetch(moduleName)
    if (!response.ok) {
      throw new Error(`Failed to load module ${moduleName}`)
    }

    return await response.text()
  }
}

const options: SandboxAsyncOptions = {
  modulePathNormalizer,
  getModuleLoader,
}

const code = `
import * as React from 'esm.sh/react@15'
import * as ReactDOMServer from 'esm.sh/react-dom@15/server'
const e = React.createElement
export default ReactDOMServer.renderToStaticMarkup(
  e('div', null, e('strong', null, 'Hello world!'))
)
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log(result)
```

## 🎯 Key Takeaways  

✅ **QuickJS enables fast and secure SSR without Node.js**.  
✅ **Modules can be dynamically loaded from esm.sh**.  
✅ **Custom module loaders allow greater flexibility**.  
✅ **QuickJS's sandboxing ensures safe execution**.  

## 🔗 Next Steps  

🚀 **Try it out**—experiment with different React components.  
🛠️ **Optimize module fetching**—cache modules for faster execution.  
🔍 **Expand functionality**—add support for props and dynamic content.  

QuickJS **makes Server-Side Rendering lightweight, efficient, and highly secure**—without requiring a full Node.js environment. 🚀  

This article **keeps things structured, engaging, and easy to follow**, making SSR with QuickJS **clear and approachable**. Let me know if you'd like any refinements!
