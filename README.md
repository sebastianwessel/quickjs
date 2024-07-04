# QuickJS package

**@sebastianwessel/quickjs: Execute JavaScript in a WebAssembly QuickJS Sandbox**

This TypeScript package allows you to safely execute JavaScript code within a WebAssembly sandbox using the QuickJS engine. Perfect for isolating and running untrusted code securely, it leverages the lightweight and fast QuickJS engine compiled to WebAssembly, providing a robust environment for code execution.

## Features

- **Security**: Run untrusted JavaScript code in a safe, isolated environment.
- **Performance**: Benefit from the lightweight and efficient QuickJS engine.
- **Versatility**: Easily integrate with existing TypeScript projects.
- **Simplicity**: User-friendly API for executing and managing JavaScript code in the sandbox.
- **File System**: Can mount a virtual file system
- **Custom Node Modules**: Custom node modules are mountable
- **Fetch Client**: Can provide a fetch client to make http(s) calls

## Installation

Install the package using npm, yarn, or bun:

```sh
npm install @sebastianwessel/quickjs
```

or

```sh
bun add @sebastianwessel/quickjs
```

or

```sh
yarn add @sebastianwessel/quickjs
```

## Usage

Here's a simple example of how to use the package:

```typescript
import { quickJS } from '@sebastianwessel/quickjs'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible 
const { initRuntime } = await quickJS()

// Create a runtime instance each time a js code should be executed
const { evalCode } = await this.initRuntime({
  allowHttp: true, // inject fetch and allow the code to fetch data
  allowFs: true, // mount a virtual file system and provide node:fs module
  env: {
    MY_ENV_VAR: 'env var value'
  },
})


const result = await evalCode(`
import { join } as path from 'path'

const fn = async ()=>{
  console.log(join('src','dist')) // logs "src/dist" on host system

  console.log(env.MY_ENV_VAR) // logs "env var value" on host system

  const url = new URL('https://example.com')

  const f = await fetch(url)

  return f.text()
}
  
export default await fn()
`)

console.log(result) // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
```

### Runtime options

```js
type RuntimeOptions = {
  /**
   * Mount a virtual file system
   * @link https://github.com/streamich/memfs
   */
  mountFs?: DirectoryJSON
  /**
   * Mount custom node_modules in a virtual file system
   * @link https://github.com/streamich/memfs
   */
  nodeModules?: DirectoryJSON
  /**
   * Enable file capabilities
   * If enabled, the package node:fs becomes available
   */
  allowFs?: boolean
  /**
   * Allow code to make http(s) calls.
   * When enabled, the global fetch will be available
   */
  allowHttp?: boolean
  /**
   * Per default, the console log inside of QuickJS is passed to the host console log.
   * Here, you can customize the handling and provide your own logging methods.
   */
  console?: {
  log: (message?: unknown, ...optionalParams: unknown[]) => void
  error: (message?: unknown, ...optionalParams: unknown[]) => void
  warn: (message?: unknown, ...optionalParams: unknown[]) => void
  }
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
  env?: Record<string, unknown>
}
```

## Core js compatibility

- ✅ mostly [ES2023](https://test262.fyi/#%7Cqjs,qjs_ng)
- ✅ ESM import support (custom modules supported)
- ✅ top-level await

| Method                 | Supported |
|------------------------|-----------|
| process.env            | ✅ (customizeable)       |
| console.log            | ✅        |
| console.error          | ✅        |
| console.warn           | ✅        |
| console.info           | ✅        |
| console.debug          | ✅        |
| console.trace          | ✅        |
| console.assert         | ✅        |
| console.count          | ✅        |
| console.countReset     | ✅        |
| console.dir            | ✅        |
| console.dirxml         | ✅        |
| console.group          | ✅        |
| console.groupCollapsed | ✅        |
| console.groupEnd       | ✅        |
| console.table          | ✅        |
| console.time           | ✅        |
| console.timeEnd        | ✅        |
| console.timeLog        | ✅        |
| console.clear          | ✅        |
| setTimeout             | ✅        |
| clearTimeout           | ✅        |
| setInterval            | ✅        |
| clearInterval          | ✅        |
| fetch                  | ✅ (set allowHttp=true)       |

## Node compatibility

### node:fs

Thanks to [memfs](https://github.com/streamich/memfs), this lib provides basic support of `node:fs` and `node:fs/promises` module.

| Method            | Supported |
|-------------------|-----------|
| access            |           |
| accessSync        |           |
| appendFile        | ✅        |
| appendFileSync    | ✅        |
| chmod             | ❌        |
| chmodSync         | ❌        |
| chown             | ❌        |
| chownSync         | ❌        |
| close             |           |
| closeSync         |           |
| copyFile          |           |
| copyFileSync      |           |
| createReadStream  |           |
| createWriteStream |           |
| exists            | ✅        |
| existsSync        | ✅        |
| fchmod            | ❌        |
| fchmodSync        | ❌         |
| fchown            | ❌         |
| fchownSync        | ❌         |
| fdatasync         |           |
| fdatasyncSync     |           |
| fstat             |           |
| fstatSync         |           |
| fsync             |           |
| fsyncSync         |           |
| ftruncate         |           |
| ftruncateSync     |           |
| futimes           |           |
| futimesSync       |           |
| lchmod            | ❌         |
| lchmodSync        | ❌        |
| lchown            | ❌         |
| lchownSync        |  ❌        |
| link              |           |
| linkSync          |           |
| lstat             |           |
| lstatSync         |           |
| mkdir             | ✅         |
| mkdirSync         | ✅         |
| mkdtemp           | ✅         |
| mkdtempSync       | ✅         |
| open              |           |
| openSync          |           |
| readdir           | ✅         |
| readdirSync       | ✅        |
| read              |           |
| readSync          |           |
| readFile          | ✅        |
| readFileSync      | ✅        |
| readlink          |           |
| readlinkSync      |           |
| realpath          |           |
| realpathSync      |           |
| rename            | ✅         |
| renameSync        | ✅         |
| rmdir             | ✅         |
| rmdirSync         | ✅         |
| stat              |           |
| statSync          |           |
| symlink           |           |
| symlinkSync       |           |
| truncate          |           |
| truncateSync      |           |
| unlink            |           |
| unlinkSync        |           |
| utimes            |           |
| utimesSync        |           |
| write             |           |
| writeSync         |           |
| writeFile         | ✅         |
| writeFileSync     | ✅         |

### node:assert

| Method          | Supported |
|-----------------|-----------|
| fail            | ✅         |
| ok              | ✅         |
| equal           | ✅         |
| notEqual        | ✅        |
| deepEqual       | ✅        |
| notDeepEqual    | ✅        |
| strictEqual     | ✅        |
| notStrictEqual  | ✅        |

### node:path

| Method               | Supported |
|----------------------|-----------|
| parse                | ✅         |
| format               | ✅        |
| extname              | ✅         |
| basename             | ✅         |
| dirname              | ✅         |
| _makeLong            | ✅         |
| relative             | ✅         |
| join                 | ✅         |
| isAbsolute           | ✅         |
| normalize            | ✅         |
| resolve              | ✅         |
| _format              | ✅         |
| normalizeStringPosix | ✅         |
| assertPath           | ✅         |

### node:util

| Method     | Supported |
|------------|-----------|
| promisify  | ✅         |
| callbackify| ✅        |
| inherits   | ✅         |
| deprecate  | ✅         |

Here are the supported `util.types` methods:

| Method                 | Supported |
|------------------------|-----------|
| isAnyArrayBuffer       | ✅        |
| isArrayBufferView      | ✅        |
| isArgumentsObject      | ✅        |
| isArrayBuffer          | ✅        |
| isAsyncFunction        | ✅        |
| isBigInt64Array        | ✅        |
| isBigUint64Array       | ✅        |
| isBooleanObject        | ✅        |
| isBoxedPrimitive       | ✅        |
| isDataView             | ✅        |
| isDate                 | ✅        |
| isFloat32Array         | ✅        |
| isFloat64Array         | ✅        |
| isGeneratorFunction    | ✅        |
| isGeneratorObject      | ✅        |
| isInt8Array            | ✅        |
| isInt16Array           | ✅        |
| isInt32Array           | ✅        |
| isMap                  | ✅        |
| isMapIterator          | ✅        |
| isNativeError          | ✅        |
| isNumberObject         | ✅        |
| isPromise              | ✅        |
| isRegExp               | ✅        |
| isSet                  | ✅        |
| isSetIterator          | ✅        |
| isSharedArrayBuffer    | ✅        |
| isStringObject         | ✅        |
| isSymbolObject         | ✅        |
| isTypedArray           | ✅        |
| isUint8Array           | ✅        |
| isUint8ClampedArray    | ✅        |
| isUint16Array          | ✅        |
| isUint32Array          | ✅        |
| isWeakMap              | ✅        |
| isWeakSet              | ✅        |

## Credits

This lib is based on:

- [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten)
- [quickjs-emscripten-sync](https://github.com/reearth/quickjs-emscripten-sync)
- [memfs](https://github.com/streamich/memfs)

Tools used:

- [Bun](https://bun.sh)
- [Biome](https://biomejs.dev)
- [Hono](https://hono.dev)
- [poolifier-web-worker](https://github.com/poolifier/poolifier-web-worker)
- [tshy](https://github.com/isaacs/tshy)
- [autocannon](https://github.com/mcollina/autocannon)

## License

This project is licensed under the MIT License.

---

This package is ideal for developers looking to execute JavaScript code securely within a TypeScript application, ensuring both performance and safety with the QuickJS WebAssembly sandbox.
