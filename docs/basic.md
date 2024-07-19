---
title: Basic Understanding
description: Get a basic understanding on how to the QuickJS module works
---

This documentation provides essential information to help you avoid common pitfalls when working with QuickJS WebAssembly runtime. The terms "host" and "guest" are used to describe your main application and the QuickJS runtime, respectively.

## Synchronous Execution

### Blocking the JavaScript Event Loop

When the `eval` method is called on the host, the event loop of the host system is blocked until the method returns.

Here is an example of how the host system can be blocked 🔥:

```typescript
import { loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

setInterval(() => {
  console.log('y')
}, 2000)

console.log('start')

const code = `
const fn = () => new Promise(() => {
  while(true) {
  }
})
export default await fn()
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code))
```

You might expect that this code does not block the host system, but it does, even with `await evalCode`. The host system must wait for the guest system to return a value. In this example, the value is never returned because of the endless while-loop.

### Setting Execution Timeouts

**❗ Set Execution Timeouts if Possible**  
It is highly recommended to set a default timeout value to avoid blocking the host system indefinitely. The execution timeout can be set in the options of `createRuntime` and `evalCode`. The smaller value between the two functions will be chosen. Setting the `executionTimeout` to `0` or `undefined` disables the execution timeout.

Timeout values are in seconds for better readability.

### Workers and Threads

It is **highly recommended** to run the guest system in separate workers or threads rather than the main thread. This approach has several critical benefits:

1. It ensures that the main event loop is not blocked.
2. Multiple workers can boost performance.
3. The host application can terminate a single worker anytime. If the guest system exceeds the maximum runtime, restarting the worker ensures a clean state.

## Asynchronous Behavior

The provided QuickJS WebAssembly runtime does not have an internal event loop like a regular runtime. Instead, the host system must trigger the loop for any provided promises. This library starts an interval on the host that triggers `executePendingJobs` in QuickJS. The interval is automatically stopped and removed when no longer needed.

When a promise is provided by the host and used by the client, the client executes until it reaches the promise. If the promise is not settled, the QuickJS runtime pauses execution. Once the promise is settled, the host needs to call `executePendingJobs` to instruct QuickJS to resume execution.

## Data Exchange Between Host and Guest

### Host to Guest

The host system can provide various data types to the guest system, including primitives, objects, functions, and promises. This library uses an `env` pattern for data and functions provided by the host, which is mirrored to `process.env` inside the guest system.

Example:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

const keyValueStoreOnHost = new Map<string, string>()

const options:SandboxOptions = {
  env: {
    MY_PROCESS_ENV: 'some environment variable provided by the host',
    KV: {
      set: (key: string, value: string) => keyValueStoreOnHost.set(key, value),
      get: (key: string) => keyValueStoreOnHost.get(key),
    },
  },
}

const code = `
console.log(env.MY_PROCESS_ENV)
env.KV.set('guest-key', 'value set by guest system')
const value = env.KV.get('guest-key')
export default value
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code, undefined, options), options)

console.log('result from guest:', result.data) // result from guest: value set by guest system
console.log('result from host:', keyValueStoreOnHost.get('guest-key')) // result from host: value set by guest system
```

#### Wrapping Functions

If a function is provided from host to guest, it should be wrapped in a dummy function.

👎 **Incorrect**:

```typescript
const options:SandboxOptions = {
  env: {
    KV: {
      set: keyValueStoreOnHost.set,
      get: keyValueStoreOnHost.get,
    },
  },
}
```

👍 **Correct**:

```typescript
const options:SandboxOptions = {
  env: {
    KV: {
      set: (key: string, value: string) => keyValueStoreOnHost.set(key, value),
      get: (key: string) => keyValueStoreOnHost.get(key),
    },
  },
}
```

**🚨 Security Information ‼️**  
The host system only provides the given values but never reads them back. Even if the guest system modifies `env.KV.set`, it will not impact the host side.

Example:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

const keyValueStoreOnHost = new Map<string, string>()

const options:SandboxOptions = {
  env: {
    KV: {
      set: (key: string, value: string) => keyValueStoreOnHost.set(key, value),
      get: (key: string) => keyValueStoreOnHost.get(key),
    },
  },
}

const code = `
env.KV.set('guest-key', 'value set by guest system')
const value = env.KV.get('guest-key')
env.KV.get = () => { throw new Error('Security!!!') }
export default value
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code, undefined, options), options)

console.log('result from guest:', result)
console.log('result from host:', keyValueStoreOnHost.get('guest-key'))
```

### Guest to Host

#### Usage of Return Value

The guest system can return a final value using `export default`. The library sets the execution mode to `module`, expecting the executed script to provide its return value via `export default`.

Example:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

const code = `
export default 'my value'
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code))

console.log('result from guest:', result.data) // result from guest: my value
```

**❗ Promises Must Be Awaited**  
If the executed script returns a promise, the promise must be awaited.

👎 **Incorrect**:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

const options:SandboxOptions = `
const prom = async () => {
  return 'my value'
}
export default prom() // promise is not awaited!!
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log('result from guest:', result.data) // result from guest: my value
```

👍 **Correct**:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

const options:SandboxOptions = `
const prom = async () => {
  return 'my value'
}
export default await prom() // promise is awaited
`
const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log('result from guest:', result.data) // result from guest: my value
```

The library wraps the result of the `eval` method into a result object, similar to the result of the `fetch` method. This makes handling success and error paths easier for developers.

A success response:

```typescript
{
  ok: true,
  data: 'the return value'
}
```

An error response:

```typescript
{
  ok: false,
  isSyntaxError: true,
  error: {
    name: "SyntaxError",
    message: "unexpected end of string",
    stack: "    at /src/index.js:9:1\n",
  }
}
```

#### Using Provided Env-Functions

It is also possible to exchange values between client and host, while the guest system is running. Therefor, the recommended approach is to call functions, provided by the host, from the client system.
Here, async functions are supported as well.
