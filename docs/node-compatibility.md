---
title: Node compatibility
description: This library provides basic support most common node core packages.
---

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