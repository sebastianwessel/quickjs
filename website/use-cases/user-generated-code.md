---
title: User Generated Code
description: Use QuickJS to run code which is provided by unknown users
order: 20
---

# User Generated Code

As soon as you need to allow the user to create or update JavaScript code that is then executed within your application, there are many things that need to be considered.

The easiest, but also most dangerous, way is to use the native JavaScript `eval` function. Aside from any security concerns (i.e., the user's intention to harm your system), the most dangerous aspect lies at the core of JavaScript itself. Since it is mainly single-threaded, and `eval` is executed within the same thread and event loop as the rest of the system, any user can accidentally harm the entire system.

## Showcase scenario

In this showcase, we assume that we have a system with JSON logs, and we want to allow the user to create a small JavaScript code snippet that decides whether an alert should be sent.

In our showcase, we expect the JSON logs to have a known, fixed structure. Furthermore, the function that should be implemented by the user has fixed input parameters and a fixed, expected output. The user can only modify the body of the function through a user-friendly, browser-based UI.

As a logical result, the user should be able to write TypeScript code, as it not only helps during development but also improves the user experience with features like autocomplete, suggestions, and code highlighting.

Given our scenario, we will focus on the backend part and begin by setting up QuickJS.

## Configuration

First of all, we need to ensure that the `typescript` package is available at runtime. It should be listed in the `dependencies` section in the `package.json` file.

Our code base, which will be executed inside of the QuickJS sandbox, will have the following shape:

```bash
|- log.jsonl // a file containing a JSON log entry per line
|- src
    |- custom.ts // the file containing the custom user code
    |- types.js // some Typescript types
    |- index.ts // the code passed into evalCode method
```

The files within the guest system:

::: code-group

```jsonl [log.jsonl]
{"message":"some log message","errorCode":0,"dateTime":"2025-02-26T07:35:10Z"}
{"message":"an error message","errorCode":1,"dateTime":"2025-02-26T07:40:00Z"}
```

```ts [src/types.ts]
export type LogRow = {
  message: string
  errorCode: number
  dateTime: string
}

export type AlertDecisionFn = ( input: LogRow[] ) => boolean
```

```ts [src/index.ts]
import { readFileSync } from 'node:fs'

import { shouldAlert } from './custom.js'
import type { LogRow } from './types.js'

const main = () => {

  const logFileContent = readFileSync('log.jsonl', 'utf-8')
  const logs: LogRow[] = logFileContent.split('\\n').map(line => JSON.parse(line))
  
  return shouldAlert(logs)
 }

export default main()
```

```ts [src/custom.ts]
import type { AlertDecisionFn } from './types.js'

export const shouldAlert: AlertDecisionFn = (input) => {
  // [...]
  // The user generated code
  // return booleanResult
}
```

:::

We can map these files in the sandbox options in our host system, to mount them into the guest system.

```ts
import { type SandboxOptions } from '../../src/index.js'

const userGeneratedCode = 'return true'

const logFileContent = `{"message":"some log message","errorCode":0,"dateTime":"2025-02-26T07:35:10Z"}
{"message":"an error message","errorCode":1,"dateTime":"2025-02-26T07:40:00Z"}`

const options: SandboxOptions = {
  allowFetch: false,
  allowFs: true,
  transformTypescript: true,
  mountFs: {
    'log.jsonl': logFileContent,
    src: {
      'types.ts': `export type LogRow = {
                    message: string
                    errorCode: number
                    dateTime: string
                  }
                  
                  export type AlertDecisionFn = ( input: LogRow[] ) => boolean`,
      'custom.ts': `import type { AlertDecisionFn } from './types.js'

      export const shouldAlert: AlertDecisionFn = (input) => {
      ${userGeneratedCode}
      }`,
    },
  },
}

```

This has the advantage, that we simply mount the JSON log data and the customized user code, while other parts of the logic are untouched.

## Executing the Code

Here is the rest of the code in the host system, which runs the customized code with the provided JSON log data as input:

```ts
import { type SandboxOptions, loadQuickJs } from '../../src/index.js' // [!code ++]

// [... configuration]

const { runSandboxed } = await loadQuickJs()

// fixed code (guest: src/index.ts)
const executionCode = `import { readFileSync } from 'node:fs'

import { shouldAlert } from './custom.js'
import type { LogRow } from './types.js'

const main = () => {

  const logFileContent = readFileSync('log.jsonl', 'utf-8')
  const logs: LogRow[] = logFileContent.split('\\n').map(line => JSON.parse(line))
  
  return shouldAlert(logs)
 }

export default main()
`

const resultSandbox = await runSandboxed(async ({ evalCode }) => {
  return await evalCode(executionCode, undefined, options)
}, options)

console.log(resultSandbox)
// {
//  ok: true,
//  data: true,
//}
```

## Adding Memory

In our usecase, it might be a good idea to have some kind of memory. This allows the user to implement debouncing functionality.

A function which is executed in the QuickJS sandbox should be seen as a stateless function, similar to a serverless function in some cloud environment.
This means the host is responsible to handle the state management. This can be done with some kind of database to persist the state.

In this example, we will use a in-memory variable in our host, to keep things simple. This variable must be accessible by the guest for read and write operations.

The data exchange between host and guest should be done via functions, provided in the `env` config parameter.

```ts
let memory: Date = new Date(0) // [!code ++]

const options: SandboxOptions = {
  allowFetch: false,
  allowFs: true,
  transformTypescript: true,
  env: { // [!code ++]
    setLastAlert: (input: Date) => { // [!code ++]
    console.log(input)
      memory = input // [!code ++]
    }, // [!code ++]
    getLastAlert: () => memory, // [!code ++]
  }, // [!code ++]
  // [...]
}
```

In the guest system, these functions are available in the `env`