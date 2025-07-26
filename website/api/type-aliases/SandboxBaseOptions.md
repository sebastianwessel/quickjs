[**@sebastianwessel/quickjs v2.3.1**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / SandboxBaseOptions

# Type Alias: SandboxBaseOptions

> **SandboxBaseOptions** = `object`

Defined in: [types/SandboxOptions.ts:12](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L12)

## Properties

### allowFetch?

> `optional` **allowFetch**: `boolean`

Defined in: [types/SandboxOptions.ts:45](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L45)

Allow code to make http(s) calls.
When enabled, the global fetch will be available

***

### allowFs?

> `optional` **allowFs**: `boolean`

Defined in: [types/SandboxOptions.ts:40](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L40)

Enable file capabilities
If enabled, the package node:fs becomes available

***

### console?

> `optional` **console**: `object`

Defined in: [types/SandboxOptions.ts:60](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L60)

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

Defined in: [types/SandboxOptions.ts:104](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L104)

The object is synchronized between host and guest system.
This means, the values on the host, can be set by the guest system

***

### enableTestUtils?

> `optional` **enableTestUtils**: `boolean`

Defined in: [types/SandboxOptions.ts:55](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L55)

Includes test framework
If enabled, the packages chai and mocha become available
They are registered global

***

### env?

> `optional` **env**: `Record`\<`string`, `unknown`\>

Defined in: [types/SandboxOptions.ts:99](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L99)

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

Defined in: [types/SandboxOptions.ts:17](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L17)

The maximum time in milliseconds a script can run.
Unset or set to 0 for unlimited execution time.

***

### fetchAdapter?

> `optional` **fetchAdapter**: *typeof* `fetch`

Defined in: [types/SandboxOptions.ts:49](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L49)

The custom fetch adapter provided as host function in the QuickJS runtime

***

### maxIntervalCount?

> `optional` **maxIntervalCount**: `number`

Defined in: [types/SandboxOptions.ts:134](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L134)

As the interval function is injected from host to client, in theory the client could create a massive amount of intervals, which are executed by the host.
This might impact the host.
Because of this, the maximum concurrent running intervals is limited by this option.

#### Default

```ts
10
```

***

### maxStackSize?

> `optional` **maxStackSize**: `number`

Defined in: [types/SandboxOptions.ts:21](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L21)

Set the max stack size for this runtime, in bytes. To remove the limit, set to 0.

***

### maxTimeoutCount?

> `optional` **maxTimeoutCount**: `number`

Defined in: [types/SandboxOptions.ts:126](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L126)

As the timeout function is injected from host to client, in theory the client could create a massive amount of timeouts, which are executed by the host.
This might impact the host.
Because of this, the maximum concurrent running timeouts is limited by this option.

#### Default

```ts
10
```

***

### memoryLimit?

> `optional` **memoryLimit**: `number`

Defined in: [types/SandboxOptions.ts:25](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L25)

Set the max memory this runtime can allocate. To remove the limit, set to -1

***

### mountFs?

> `optional` **mountFs**: `NestedDirectoryJSON` \| `IFs`

Defined in: [types/SandboxOptions.ts:30](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L30)

Mount a virtual file system

#### Link

https://github.com/streamich/memfs

***

### nodeModules?

> `optional` **nodeModules**: `NestedDirectoryJSON`

Defined in: [types/SandboxOptions.ts:35](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L35)

Mount custom node_modules in a virtual file system

#### Link

https://github.com/streamich/memfs

***

### transformCompilerOptions?

> `optional` **transformCompilerOptions**: `TS.CompilerOptions`

Defined in: [types/SandboxOptions.ts:118](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L118)

The Typescript compiler options for transpiling files from typescript to JavaScript

***

### transformTypescript?

> `optional` **transformTypescript**: `boolean`

Defined in: [types/SandboxOptions.ts:114](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L114)

Transpile all typescript files to javascript file in mountFs
Requires dependency typescript to be installed

***

### typescriptImportFile?

> `optional` **typescriptImportFile**: `string`

Defined in: [types/SandboxOptions.ts:109](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxOptions.ts#L109)

The Typescript lib to import

#### Default

```ts
typescript
```
