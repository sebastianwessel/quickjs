---
title: Node compatibility
description: This library provides basic support most common node core packages.
---

This library tries to provide basic support for most common used Node.js modules and use cases. The focus is not to provide a 100% Node.js compatibility environment.

| Module           | Supported | Description                                                   |
|------------------|-----------|---------------------------------------------------------------|
| `assert`         | ✅        | Provides a set of assertion functions for testing             |
| `async_hooks`    | ❌         | Provides an API to track asynchronous resources               |
| `buffer`         | ✅        | Provides a way of handling binary data                        |
| `child_process`  | ❌        | Allows for the creation of child processes                    |
| `cluster`        | ❌        | Provides support for creating a cluster of Node.js processes  |
| `console`        | ❌         | Simple debugging console similar to the JavaScript console    |
| `crypto`         | ❌         | Provides cryptographic functionality                          |
| `dgram`          | ❌        | Provides implementation of UDP datagram sockets               |
| `dns`            | ❌         | Provides DNS lookups and name resolution functions            |
| `domain`         | ❌         | Simplified handling of uncaught exceptions                    |
| `events`         | ❌         | Provides an event-driven programming model                    |
| `fs`             | ✅        | Provides an API for interacting with the file system          |
| `http`           | ❌        | Provides HTTP server and client functionality                 |
| `http2`          | ❌        | Provides HTTP/2 server and client functionality               |
| `https`          | ❌        | Provides HTTPS server and client functionality                |
| `inspector`      | ❌        | Provides an interface for debugging Node.js applications      |
| `module`         | ✅        | Load and manage Node.js modules                               |
| `net`            | ❌        | Provides an asynchronous network API                          |
| `os`             | ❌         | Provides operating system-related utility methods             |
| `path`           | ✅        | Provides utilities for working with file and directory paths  |
| `perf_hooks`     | ❌         | Performance timing APIs                                       |
| `process`        | ✅         | Provides information and control over the current process     |
| `punycode`       | ✅        | Provides encoding and decoding of Punycode                    |
| `querystring`    | ✅        | Provides utilities for parsing and formatting URL query strings|
| `readline`       | ❌         | Provides an interface for reading data from a Readable stream |
| `repl`           | ❌         | Provides a Read-Eval-Print Loop (REPL) interface              |
| `stream`         | ❌         | Provides an API for implementing stream-based I/O             |
| `string_decoder` | ✅         | Provides utilities for decoding buffer objects into strings   |
| `timers`         | ❌         | Provides timer functions similar to those in JavaScript       |
| `tls`            | ❌         | Provides an implementation of TLS and SSL protocols           |
| `trace_events`   | ❌         | Provides a mechanism to centralize tracing information        |
| `tty`            | ❌         | Provides utilities for working with TTYs (terminals)          |
| `url`            | ✅         | Provides utilities for URL resolution and parsing             |
| `util`           | ✅        | Provides various utility functions                            |
| `v8`             | ❌        | Provides an API for interacting with the V8 JavaScript engine |
| `vm`             | ❌        | Provides APIs for compiling and running code within V8 VM contexts |
| `worker_threads` | ❌        | Provides a mechanism to use threads for JavaScript execution  |
| `zlib`           | ❌         | Provides compression and decompression functionalities        |

## node:fs

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
| lchownSync        | ❌        |
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

## node:assert

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

## node:module

| Method          | Supported |
|-----------------|-----------|
| createRequire   | ✅         |
| isBuiltin       | ✅         |
| register        | ❌         |
| syncBuiltinESMExports | ❌        |

## node:path

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

## node:util

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