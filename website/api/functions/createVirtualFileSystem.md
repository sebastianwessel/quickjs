[**@sebastianwessel/quickjs v3.1.0**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / createVirtualFileSystem

# Function: createVirtualFileSystem()

> **createVirtualFileSystem**(`runtimeOptions?`): `object`

Defined in: [createVirtualFileSystem.ts:49](https://github.com/sebastianwessel/quickjs/blob/main/src/createVirtualFileSystem.ts#L49)

Create the virtual file system for the sandbox
Creates a node_modules folder with packages and ensures the src folder

## Parameters

### runtimeOptions?

[`RuntimeOptions`](../type-aliases/RuntimeOptions.md) = `{}`

## Returns

`object`

filesystem fs and volume vol

### fs

> **fs**: `IFs`

### vol

> **vol**: `Volume`
