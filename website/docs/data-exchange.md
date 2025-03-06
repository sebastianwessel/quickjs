---
title: Host-Guest Data Exchange
description: Data exchange between host and guest system
order: 30
---

# Host-Guest Data Exchange

In general, the host and guest systems are completely separated. At first glance, exchanging data may seem straightforward since both the host and guest use JavaScript. However, the guest system runs in a WebAssembly sandbox, meaning data can only be exchanged through low-level functions.

Fortunately, this library and its dependencies handle this process in a black-box manner, so developers don’t need to manage it manually.

It is important to understand that when data is passed between the guest and host, it is not shared but copied. Instead of referencing the same object, a new instance with the same value is created.

For example, if the host provides a string to the guest, a new string with the same value is created within the guest system. This means that modifying the string in the host does not directly affect the guest, and vice versa.

To accommodate this and adhere to clean code principles, getter and setter functions should be used.

## Host to Guest

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

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log('result from guest:', result.data) // result from guest: value set by guest system
console.log('result from host:', keyValueStoreOnHost.get('guest-key')) // result from host: value set by guest system
```

### Wrapping Functions

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

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log('result from guest:', result)
console.log('result from host:', keyValueStoreOnHost.get('guest-key'))
```

## Guest to Host

### Usage of Return Value

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
export default prom() // 🚨 promise is not awaited!!
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code), options)

console.log('result from guest:', result.data) // result from guest: my value
```

**Here, the promise itself is returned to the host, but not the result of the promise!**

👍 **Correct**:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

const options:SandboxOptions = `
const prom = async () => {
  return 'my value'
}
export default await prom() // 👍 promise is awaited
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

### Using Provided Env-Functions

It is also possible to exchange values between client and host, while the guest system is running. Therefor, the recommended approach is to call functions, provided by the host, from the client system.
Here, async functions are supported as well.

## Non-Primitives

Exchanging non-primitives, like functions and classes, should be avoid. In general, it is also possible to exchange these type of data. But in real world scenarios, it can become quite tricky.

### Classes

A class itself must exist in the host and the guest system. Furthermore, as data is copied and not shared, there will always be a class instance in the host system, and a other class instance in the guest system. The state of both instances must be kept in sync.

### Functions

Exchanging functions works, but brings up the question, in which context the function should be executed.  
This library shares functions from host to the guest system. This means, the client system can call a host function, which is executed within the hosts context. The result is than passed to the client system.
The opposite way is also possible, as the host can call the `evalCode` method.
