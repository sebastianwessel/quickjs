[**@sebastianwessel/quickjs v2.3.1**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / loadAsyncQuickJs

# Function: loadAsyncQuickJs()

> **loadAsyncQuickJs**(`variant`): `Promise`\<\{ `module`: `QuickJSAsyncWASMModule`; `runSandboxed`: \<`T`\>(`sandboxedFunction`, `sandboxOptions`) => `Promise`\<`T`\>; \}\>

Defined in: [loadAsyncQuickJs.ts:19](https://github.com/sebastianwessel/quickjs/blob/main/src/loadAsyncQuickJs.ts#L19)

Loads the QuickJS async module and returns a sandbox execution function.

## Parameters

### variant

`QuickJSAsyncVariant`

Options for loading the QuickJS module. Defaults to '@jitl/quickjs-ng-wasmfile-release-asyncify'.

## Returns

`Promise`\<\{ `module`: `QuickJSAsyncWASMModule`; `runSandboxed`: \<`T`\>(`sandboxedFunction`, `sandboxOptions`) => `Promise`\<`T`\>; \}\>

An object containing the runSandboxed function and the loaded module.
