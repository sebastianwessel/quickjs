[**@sebastianwessel/quickjs v2.3.1**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / RuntimeOptions

# Type Alias: RuntimeOptions

> **RuntimeOptions** = `object`

Defined in: [types/RuntimeOptions.ts:4](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L4)

## Properties

### allowFetch?

> `optional` **allowFetch**: `boolean`

Defined in: [types/RuntimeOptions.ts:29](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L29)

Allow code to make http(s) calls.
When enabled, the global fetch will be available

***

### allowFs?

> `optional` **allowFs**: `boolean`

Defined in: [types/RuntimeOptions.ts:24](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L24)

Enable file capabilities
If enabled, the package node:fs becomes available

***

### console?

> `optional` **console**: `object`

Defined in: [types/RuntimeOptions.ts:44](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L44)

Per default, the console log inside of QuickJS is passed to the host console log.
Here, you can customize the handling and provide your own logging methods.

#### assert()?

> `optional` **assert**: (`condition?`, ...`data`) => `void`

##### Parameters

###### condition?

`boolean`

###### data?

...`unknown`[]

##### Returns

`void`

#### clear()?

> `optional` **clear**: () => `void`

##### Returns

`void`

#### count()?

> `optional` **count**: (`label?`) => `void`

##### Parameters

###### label?

`string`

##### Returns

`void`

#### countReset()?

> `optional` **countReset**: (`label?`) => `void`

##### Parameters

###### label?

`string`

##### Returns

`void`

#### debug()?

> `optional` **debug**: (`message?`, ...`optionalParams`) => `void`

##### Parameters

###### message?

`unknown`

###### optionalParams?

...`unknown`[]

##### Returns

`void`

#### dir()?

> `optional` **dir**: (`item?`, `options?`) => `void`

##### Parameters

###### item?

`unknown`

###### options?

`object`

##### Returns

`void`

#### dirxml()?

> `optional` **dirxml**: (...`data`) => `void`

##### Parameters

###### data

...`unknown`[]

##### Returns

`void`

#### error()?

> `optional` **error**: (`message?`, ...`optionalParams`) => `void`

##### Parameters

###### message?

`unknown`

###### optionalParams?

...`unknown`[]

##### Returns

`void`

#### group()?

> `optional` **group**: (...`label`) => `void`

##### Parameters

###### label

...`unknown`[]

##### Returns

`void`

#### groupCollapsed()?

> `optional` **groupCollapsed**: (...`label`) => `void`

##### Parameters

###### label

...`unknown`[]

##### Returns

`void`

#### groupEnd()?

> `optional` **groupEnd**: () => `void`

##### Returns

`void`

#### info()?

> `optional` **info**: (`message?`, ...`optionalParams`) => `void`

##### Parameters

###### message?

`unknown`

###### optionalParams?

...`unknown`[]

##### Returns

`void`

#### log()?

> `optional` **log**: (`message?`, ...`optionalParams`) => `void`

##### Parameters

###### message?

`unknown`

###### optionalParams?

...`unknown`[]

##### Returns

`void`

#### table()?

> `optional` **table**: (`tabularData?`, `properties?`) => `void`

##### Parameters

###### tabularData?

`unknown`

###### properties?

`string`[]

##### Returns

`void`

#### time()?

> `optional` **time**: (`label?`) => `void`

##### Parameters

###### label?

`string`

##### Returns

`void`

#### timeEnd()?

> `optional` **timeEnd**: (`label?`) => `void`

##### Parameters

###### label?

`string`

##### Returns

`void`

#### timeLog()?

> `optional` **timeLog**: (`label?`, ...`data`) => `void`

##### Parameters

###### label?

`string`

###### data?

...`unknown`[]

##### Returns

`void`

#### trace()?

> `optional` **trace**: (`message?`, ...`optionalParams`) => `void`

##### Parameters

###### message?

`unknown`

###### optionalParams?

...`unknown`[]

##### Returns

`void`

#### warn()?

> `optional` **warn**: (`message?`, ...`optionalParams`) => `void`

##### Parameters

###### message?

`unknown`

###### optionalParams?

...`unknown`[]

##### Returns

`void`

***

### dangerousSync?

> `optional` **dangerousSync**: `Record`\<`string`, `unknown`\>

Defined in: [types/RuntimeOptions.ts:88](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L88)

The object is synchronized between host and guest system.
This means, the values on the host, can be set by the guest system

***

### enableTestUtils?

> `optional` **enableTestUtils**: `boolean`

Defined in: [types/RuntimeOptions.ts:39](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L39)

Includes test framework
If enabled, the packages chai and mocha become available
They are registered global

***

### env?

> `optional` **env**: `Record`\<`string`, `unknown`\>

Defined in: [types/RuntimeOptions.ts:83](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L83)

Key-value list of ENV vars, which should be available in QuickJS
It is not limited to primitives like string and numbers.
Objects, arrays and functions can be provided as well.

#### Example

```js
// in config
{
  env: {
    My_ENV: 'my var'
  }
}

// inside of QuickJS
console.log(env.My_ENV) // outputs: my var
```

***

### executionTimeout?

> `optional` **executionTimeout**: `number`

Defined in: [types/RuntimeOptions.ts:9](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L9)

The maximum time in seconds a script can run.
Unset or set to 0 for unlimited execution time.

***

### fetchAdapter?

> `optional` **fetchAdapter**: *typeof* `fetch`

Defined in: [types/RuntimeOptions.ts:33](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L33)

The custom fetch adapter provided as host function in the QuickJS runtime

***

### mountFs?

> `optional` **mountFs**: `NestedDirectoryJSON` \| `IFs`

Defined in: [types/RuntimeOptions.ts:14](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L14)

Mount a virtual file system

#### Link

https://github.com/streamich/memfs

***

### nodeModules?

> `optional` **nodeModules**: `NestedDirectoryJSON`

Defined in: [types/RuntimeOptions.ts:19](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L19)

Mount custom node_modules in a virtual file system

#### Link

https://github.com/streamich/memfs

***

### transformCompilerOptions?

> `optional` **transformCompilerOptions**: `TS.CompilerOptions`

Defined in: [types/RuntimeOptions.ts:97](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L97)

The Typescript compiler options for transpiling files from typescript to JavaScript

***

### transformTypescript?

> `optional` **transformTypescript**: `boolean`

Defined in: [types/RuntimeOptions.ts:93](https://github.com/sebastianwessel/quickjs/blob/main/src/types/RuntimeOptions.ts#L93)

Transpile all typescript files to javascript file in mountFs
Requires dependency typescript to be installed
