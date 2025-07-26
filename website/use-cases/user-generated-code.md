---
title: User-Generated Code
description: Use QuickJS to run code which is provided by unknown users
image: /use-case-user.jpg
order: 20
---

# Executing User-Generated Code Safely

Allowing users to create and execute JavaScript code inside your application can unlock powerful customization and automation capabilities. However, it also introduces **security risks**, **performance concerns**, and **sandboxing challenges**.

The **wrong approach** (such as using JavaScript’s built-in `eval`) can **expose your system to serious vulnerabilities**, including infinite loops, crashes, and unauthorized access to sensitive data.

In this article, we'll walk through a **safe and efficient way** to execute user-generated JavaScript code using **QuickJS**, a lightweight JavaScript engine that enables sandboxed execution.

## 🚨 Why Not Use `eval`?

Using `eval` for user-generated code may seem like the easiest solution, but it's also the **most dangerous**:

❌ **Security Risks** – Users could execute malicious code, access system resources, or modify global variables.
❌ **Performance Issues** – JavaScript is **single-threaded**; if a user writes an infinite loop, it will block execution entirely.
❌ **Lack of Isolation** – `eval` runs **inside your main thread**, meaning **any bug or infinite loop can crash your entire application**.

A **better solution** is to run user-generated code inside a **secure, sandboxed environment** where it cannot interfere with the host system.

## 📌 Use Case: JSON Log Processing

Let’s consider a **real-world scenario**:

✅ We have a **JSON log file** that records system events.
✅ Users should be able to **write their own logic** to decide whether an **alert should be triggered**.
✅ The code should be **executed safely**, without the risk of interfering with the host system.
✅ Users should be able to **write TypeScript**, benefiting from **autocomplete, type checking, and code suggestions**.

We'll use **QuickJS** to sandbox and safely execute the user’s logic.

## 🔧 Setting Up the Sandbox

### 1️⃣ **Project Structure**

We'll structure our project as follows:

```bash
|- log.jsonl       # JSON logs (one entry per line)
|- src
    |- custom.ts   # User-created code
    |- types.ts    # Type definitions
    |- index.ts    # Main execution file
```

### 2️⃣ **Example Data (Log File & Type Definitions)**

#### 📝 `log.jsonl`

```jsonl
{"message":"some log message","errorCode":0,"dateTime":"2025-02-26T07:35:10Z"}
{"message":"an error message","errorCode":1,"dateTime":"2025-02-26T07:40:00Z"}
```

#### 📌 `src/types.ts` (Defining Log Format & Alert Function)

```ts
export type LogRow = {
  message: string;
  errorCode: number;
  dateTime: string;
};

export type AlertDecisionFn = (input: LogRow[]) => boolean;
```

#### 📝 `src/index.ts` (Main Execution)

```ts
import { readFileSync } from "node:fs";
import { shouldAlert } from "./custom.js";
import type { LogRow } from "./types.js";

const main = () => {
  const logFileContent = readFileSync("log.jsonl", "utf-8");
  const logs: LogRow[] = logFileContent
    .split("\n")
    .map((line) => JSON.parse(line));

  return shouldAlert(logs);
};

export default main();
```

#### 🎨 `src/custom.ts` (User-Written Code)

```ts
import type { AlertDecisionFn } from "./types.js";

export const shouldAlert: AlertDecisionFn = (input) => {
  // User-defined logic
  // return booleanResult
};
```

---

## ⚙️ Mounting Files in the Sandbox

We'll map these files into a **QuickJS sandbox**, allowing users to edit only `custom.ts`, while keeping the rest of the logic **untouched**.

```ts
import { type SandboxOptions } from "../../src/index.js";

const userGeneratedCode = "return true"; // Example user input

const logFileContent = `{"message":"some log message","errorCode":0,"dateTime":"2025-02-26T07:35:10Z"}
{"message":"an error message","errorCode":1,"dateTime":"2025-02-26T07:40:00Z"}`;

const options: SandboxOptions = {
  allowFetch: false,
  allowFs: true,
  transformTypescript: true,
  mountFs: {
    "log.jsonl": logFileContent,
    src: {
      "types.ts": `export type LogRow = {
                    message: string
                    errorCode: number
                    dateTime: string
                  }

                  export type AlertDecisionFn = ( input: LogRow[] ) => boolean`,
      "custom.ts": `import type { AlertDecisionFn } from './types.js'

      export const shouldAlert: AlertDecisionFn = (input) => {
      ${userGeneratedCode}
      }`,
    },
  },
};
```

🔹 This setup **mounts the JSON log data and the user’s code** while keeping the **execution logic intact**.

## 🚀 Running the User's Code

Here’s how the **sandboxed execution** works:

```ts
import { type SandboxOptions, loadQuickJs } from "../../src/index.js";
import variant from "@jitl/quickjs-ng-wasmfile-release-sync";

const { runSandboxed } = await loadQuickJs(variant);

const executionCode = `import { readFileSync } from 'node:fs'
import { shouldAlert } from './custom.js'
import type { LogRow } from './types.js'

const main = () => {
  const logFileContent = readFileSync('log.jsonl', 'utf-8')
  const logs: LogRow[] = logFileContent.split('\\n').map(line => JSON.parse(line))

  return shouldAlert(logs)
}

export default main()
`;

const resultSandbox = await runSandboxed(async ({ evalCode }) => {
  return await evalCode(executionCode);
}, options);

console.log(resultSandbox);
// Output:
// { ok: true, data: true }
```

✅ **The user’s logic is executed safely**, and their function determines whether an alert should be triggered.

## 🏗️ Adding Memory (State Management)

To improve functionality, we can **add persistent memory**. This allows the function to track **previous alerts**, implementing **debouncing** or **rate limiting**.

Since **QuickJS functions are stateless**, the **host system** should manage state.

### 💾 Storing State in Memory

We’ll store the **last alert time** in the host and expose functions for **reading and updating** it.

```ts
let memory: Date = new Date(0); // Store last alert timestamp

const options: SandboxOptions = {
  allowFetch: false,
  allowFs: true,
  transformTypescript: true,
  env: {
    setLastAlert: (input: Date) => {
      console.log("Setting last alert:", input);
      memory = input;
    },
    getLastAlert: () => memory,
  },
};
```

### 🛠️ Accessing State from the Guest

Inside the sandbox, the user can now call `env.getLastAlert()` and `env.setLastAlert(new Date())` to manage state.

## 🎯 Key Takeaways

✅ **QuickJS provides a safe, isolated sandbox** for executing user-generated JavaScript code.
✅ **No risk of crashes, infinite loops, or unauthorized system access.**
✅ **TypeScript support** allows users to write code with better tooling (autocomplete, suggestions).
✅ **Custom memory handling** can be used for debouncing or rate limiting logic.

With this setup, **user-generated JavaScript execution becomes secure, efficient, and highly customizable** — without compromising system stability. 🚀

## 🔗 Next Steps

👉 **Try it out:** Implement QuickJS in your own project.
👉 **Enhance security:** Add execution timeouts and memory limits.
👉 **Expand functionality:** Allow users to fetch external data securely.

QuickJS makes **sandboxing user-generated code easy and secure** — without the headaches of `eval`. 🎯
