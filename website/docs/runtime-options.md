---
title: Runtime Options
description: The QuickJS sandbox provides a wide range of options to align the runtime to your needs
order: 30
---

## Type Definition

```typescript
type RuntimeOptions = {
  /**
   * The maximum time in seconds a script can run.
   * Unset or set to 0 for unlimited execution time.
   */
  executionTimeout?: number;

  /**
   * Mount a virtual file system
   * @link https://github.com/streamich/memfs
   */
  mountFs?: DirectoryJSON;

  /**
   * Mount custom node_modules in a virtual file system
   * @link https://github.com/streamich/memfs
   */
  nodeModules?: DirectoryJSON;

  /**
   * Enable file capabilities
   * If enabled, the package node:fs becomes available
   */
  allowFs?: boolean;

  /**
   * Allow code to make http(s) calls.
   * When enabled, the global fetch will be available
   */
  allowFetch?: boolean;

  /**
  * The custom fetch adapter provided as host function in the QuickJS runtime
  */
  fetchAdapter?: typeof fetch

  /**
   * Includes test framework
   * If enabled, the packages chai and mocha become available
   * They are registered global
   */
  enableTestUtils?: boolean;

  /**
   * Per default, the console log inside of QuickJS is passed to the host console log.
   * Here, you can customize the handling and provide your own logging methods.
   */
  console?: {
    log?: (message?: unknown, ...optionalParams: unknown[]) => void;
    error?: (message?: unknown, ...optionalParams: unknown[]) => void;
    warn?: (message?: unknown, ...optionalParams: unknown[]) => void;
    info?: (message?: unknown, ...optionalParams: unknown[]) => void;
    debug?: (message?: unknown, ...optionalParams: unknown[]) => void;
    trace?: (message?: unknown, ...optionalParams: unknown[]) => void;
    assert?: (condition?: boolean, ...data: unknown[]) => void;
    count?: (label?: string) => void;
    countReset?: (label?: string) => void;
    dir?: (item?: unknown, options?: object) => void;
    dirxml?: (...data: unknown[]) => void;
    group?: (...label: unknown[]) => void;
    groupCollapsed?: (...label: unknown[]) => void;
    groupEnd?: () => void;
    table?: (tabularData?: unknown, properties?: string[]) => void;
    time?: (label?: string) => void;
    timeEnd?: (label?: string) => void;
    timeLog?: (label?: string, ...data: unknown[]) => void;
    clear?: () => void;
  };

  /**
   * Key-value list of ENV vars, which should be available in QuickJS
   *
   * @example
   * ```js
   * // in config
   * {
   *   env: {
   *     My_ENV: 'my var'
   *   }
   * }
   *
   * // inside of QuickJS
   * console.log(env.My_ENV) // outputs: my var
   * ```
   */
  env?: Record<string, unknown>;
}
```

## Example Usage

The options are passed to the `createRuntime` method. Here is a basic example:

```typescript
import { type SandboxOptions, loadQuickJs } from '@sebastianwessel/quickjs'

const { runSandboxed } = await loadQuickJs()

// Create a runtime instance each time a JS code should be executed
const options:SandboxOptions = {
  allowFetch: true, // inject fetch and allow the code to fetch data
  allowFs: true,    // mount a virtual file system and provide node:fs module
  env: {
    MY_ENV_VAR: 'env var value'
  },
  console: {
    log: (message, ...optionalParams) => {
      console.log(`[QuickJS Log]: ${message}`, ...optionalParams);
    },
    error: (message, ...optionalParams) => {
      console.error(`[QuickJS Error]: ${message}`, ...optionalParams);
    }
    // Customize other console methods as needed
  }
};

const code = `
import { join } as path from 'path';

const fn = async () => {
  console.log(join('src', 'dist')); // logs "src/dist" on host system

  console.log(env.MY_ENV_VAR); // logs "env var value" on host system

  const url = new URL('https://example.com');

  const f = await fetch(url);

  return f.text();
}

export default await fn();
`

const result = await runSandboxed(async ({ evalCode }) => evalCode(code, undefined, options), options)

console.log(result); // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
```

This example demonstrates how to set up and use the `createRuntime` method with various runtime options, including environment variables, file system access, and HTTP fetch capabilities. Custom console methods are also provided to tailor the logging output.
