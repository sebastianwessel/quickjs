---
title: Basic Understanding
description: Get a basic understanding on how to the QuickJS module works
order: 10
---

# Basic Understanding

This documentation provides essential information to help you avoid common pitfalls when working with QuickJS WebAssembly runtime. The terms "host" and "guest" are used to describe your main application and the QuickJS runtime, respectively.

::: warning
As the QuickJS sandbox is running via WebAssembly, the JavaScript eventloop gets blocked by the WebAssembly execution.
:::

## Security Scope

This library provides a strong sandboxing layer for host/guest execution, but it is not a complete security boundary by itself.

- Engine-level vulnerabilities in QuickJS are upstream scope.
- Therefore, use this package in a defense-in-depth architecture.

Please read the dedicated guidance:
[Security Model & Hardening](./security-model.md)

## Synchronous Execution

### 🚫 Blocking the JavaScript Event Loop

When the `evalCode` method is called on the host, the event loop of the host system is blocked until the method returns.

Here is an example of how the host system can be blocked 🔥:

```typescript
import { loadQuickJs } from "@sebastianwessel/quickjs";
import variant from "@jitl/quickjs-ng-wasmfile-release-sync";

const { runSandboxed } = await loadQuickJs(variant);

setInterval(() => {
  console.log("y");
}, 2000);

console.log("start");

const code = `
const fn = () => new Promise(() => {
  while(true) {
  }
})
export default await fn()
`;

const result = await runSandboxed(async ({ evalCode }) => evalCode(code));
```

You might expect that this code does not block the host system, but it does, even with `await evalCode`. The host system must wait for the guest system to return a value. In this example, the value is never returned because of the endless while-loop.

### ⏳ Setting Execution Timeouts

**❗ Set Execution Timeouts if Possible**
It is highly recommended to set a default timeout value to avoid blocking the host system indefinitely. The execution timeout can be set in the options of `runSandboxed`. Setting the `executionTimeout` to `0` or `undefined` disables the execution timeout.

Timeout values are in milliseconds.

**Please see: [Runtime Options - Execution Limits](./runtime-options.md)**

### 👷 Workers and Threads

It is **highly recommended** to run the guest system in separate workers or threads rather than the main thread. This approach has several critical benefits:

1. It ensures that the main event loop is not blocked.
2. Multiple workers can boost performance.
3. The host application can terminate a single worker anytime. If the guest system exceeds the maximum runtime, restarting the worker ensures a clean state.

## Asynchronous Behavior

The provided QuickJS WebAssembly runtime does not have an internal event loop like a regular runtime. Instead, the host system must trigger the loop for any provided promises. This library starts an interval on the host that triggers `executePendingJobs` in QuickJS. The interval is automatically stopped and removed when no longer needed.

When a promise is provided by the host and used by the client, the client executes until it reaches the promise. If the promise is not settled, the QuickJS runtime pauses execution. Once the promise is settled, the host needs to call `executePendingJobs` to instruct QuickJS to resume execution.
