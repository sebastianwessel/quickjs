---
title: Fetch in Guest System
description: Information about the usage of fetch inside of the QuickJS runtime, security advices and best pratices
---

Allowing the guest system inside a sandbox to connect to the outside world is potentially risky. Therefore, the usage should be restricted as much as possible.

## Consider Alternatives

Balancing technical needs, possibilities, security, and implementation overhead highly depends on the individual application.

As general rules:

- If it can be restricted, it should be restricted.
- If it can be avoided, it should be avoided.
- If possible, the host system should have control and should only provide the needed information.
- Consider runtime validation for inputs and outputs.

A common example is calling an API. A better alternative is to create a helper function provided to the host instead of providing full fetch functionality to the guest system, especially in cases where the API is protected and/or the creator of the executed code is "some user."

### Simple Example

```typescript
import { quickJS } from '@sebastianwessel/quickjs'
import { z } from 'zod'

const getData = async (input: string) => {
  try {
    // Do not trust the client system - validate input
    const id = z.string().parse(input)

    const result = await fetch('https://example.com/api/' + id, {
      // Secrets are only available on the host system
      headers: { Authentication: 'Bearer MY_SECRET_ONLY_ON_HOST' },
    })

    if (result.ok) {
      const payload = await result.json()

      // Validate & strip out any data that is not required
      const payloadValidationSchema = z.object({
        myValue: z.string(),
      })

      return payloadValidationSchema.parse(payload)
    }
  } catch (_err) {
    // Do not expose host internal details
    throw new Error('Request failed')
  }
}

const { createRuntime } = await quickJS()

const { evalCode } = await createRuntime({
  allowFetch: false,
  env: {
    getExternalData: getData,
  },
})

const result = await evalCode(`
const fn = async ()=>{
  const data = await env.getExternalData('some-id')

  return data.myValue
}
  
export default await fn()
`)

console.log(result)
```

## Default Adapter

The default fetch adapter, which is provided by default, has basic default settings to improve security. However, developers should not expect this default client to be secure and cover all potential issues.

The `getDefaultFetchAdapter` function provides a customizable fetch adapter with additional features such as rate limiting, protocol and host restrictions, virtual file system support, timeout management, and CORS policy enforcement. This adapter can be used to enhance the security and control of fetch requests in various applications.

### Options

The `getDefaultFetchAdapter` function accepts an options object to configure its behavior. Below is a table describing the available options and their default values:

| Option               | Type         | Description                                                        | Default Value                  |
|----------------------|--------------|--------------------------------------------------------------------|--------------------------------|
| `fs`                 | `IFs`        | The virtual file system of the sandbox (excludes node_modules)     | `undefined`                    |
| `allowedHosts`       | `string[]`   | List of allowed hosts. If set, only these hosts are allowed to call| `undefined`                    |
| `allowedProtocols`   | `string[]`   | List of allowed protocols. If set, only these protocols are allowed to call | `['http:', 'https:']` |
| `disallowedHosts`    | `string[]`   | List of disallowed hosts.                                          | `['localhost', '127.0.0.1']`   |
| `timeout`            | `number`     | Timeout for fetch requests in milliseconds                         | `5000` (5 seconds)             |
| `corsCheck`          | `boolean`    | Flag to enable CORS policy check                                   | `false`                        |
| `allowedCorsOrigins` | `string[]`   | List of allowed CORS origins                                       | `['*']`                        |
| `rateLimitPoints`    | `number`     | Number of requests allowed in the specified duration               | `10`                           |
| `rateLimitDuration`  | `number`     | Duration in seconds for the rate limit                             | `1`                            |

## Features

### Rate Limiting

The fetch adapter enforces rate limiting to control the number of requests allowed in a specified duration.

- **Options**:
  - `rateLimitPoints`: Number of requests allowed.
  - `rateLimitDuration`: Duration in seconds for the rate limit.

### Protocol and Host Restrictions

The fetch adapter can restrict requests based on allowed and disallowed hosts and protocols.

- **Options**:
  - `allowedHosts`: List of allowed hosts.
  - `disallowedHosts`: List of disallowed hosts.
  - `allowedProtocols`: List of allowed protocols.

### Timeout Management

The fetch adapter supports setting a timeout for fetch requests to prevent long-running requests.

- **Options**:
  - `timeout`: Timeout for fetch requests in milliseconds.

### CORS Policy Enforcement

The fetch adapter can enforce CORS policies based on allowed origins.

- **Options**:
  - `corsCheck`: Flag to enable CORS policy check.
  - `allowedCorsOrigins`: List of allowed CORS origins.

### Virtual File System Support

The fetch adapter can work with a virtual file system to handle file protocol requests.

- **Options**:
  - `fs`: The virtual file system of the sandbox.
