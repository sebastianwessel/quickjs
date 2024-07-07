---
title: Basic Understanding
description: Get a basic understanding on how to the QuickJS module works
---

Here are some information, which will help you to prevent some pitfalls.
Here, the naming host and guest are used, as it is the general name pattern for such systems.
The host is your main application, and the guest is the webassembly QuickJS runtime.

## Synchonus Execution

In general, the interaction with the guest system is synchonus.

### Blocking the JavaScript Eventloop

If the `eval` in the host is called, the event loop from the host system is blocked, until the method returns.

Here is an example, on how you can block the host system 🔥:

```typescript
import { quickJS } from './src/index.js'

const { createRuntime } = await quickJS()

const { evalCode } = await createRuntime()

setInterval(() => {
  console.log('y')
}, 2000)

console.log('start')

const result = await evalCode(`

const fn = () => new Promise(() => {
  while(true) {
  }
})
  
export default await fn()
`)

```

You might expect, that this code does not block the host system, but is does, even if we set `await evalCode`.
The issue is, that the host system needs to waiting for the guest system, to return a value.
A value is returned, after the the whole script is being executed. In our case, this does never happend, because of the endless while-loop.
In this example, we do not await for a promise to be resolved. We need to wait for the actual promise itself, to be returned by the guest system.

**❗️ Set execeution timeouts if possible**

As an fallback, it is highly recommended, to set a default timeout value.
The execution timeout value can be set in the options of `createRuntime` and `evalCode`. If it is set in both functions, the smaller value will be chosen.
Setting the option `executionTimeout` to `0` or `undefined`, means disabling the execution timeout. Setting the timeout to `0` in  `evalCode`, while some value was set before in `createRuntime`, won´t disable the timeout handling.

The timeout values are in seconds, to provide a more human friendly reading.

### Worker & Threads

It is **highly recommended**, to not run the guest system in the main thread.
Instead, you should span workers/threads, which run on their own.

## Data from Host to Guest

## Data from Guest to Host