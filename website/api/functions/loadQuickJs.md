[**@sebastianwessel/quickjs v3.1.0**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / loadQuickJs

# Function: loadQuickJs()

> **loadQuickJs**(`variant`): `Promise`\<\{ `module`: `QuickJSWASMModule`; `runSandboxed`: \<`T`\>(`sandboxedFunction`, `sandboxOptions`) => `Promise`\<`T`\>; \}\>

Defined in: [loadQuickJs.ts:19](https://github.com/sebastianwessel/quickjs/blob/main/src/loadQuickJs.ts#L19)

Loads the QuickJS module and returns a sandbox execution function.

## Parameters

### variant

`QuickJSSyncVariant`

Options for loading the QuickJS module. Defaults to '@jitl/quickjs-ng-wasmfile-release-sync'.

## Returns

`Promise`\<\{ `module`: `QuickJSWASMModule`; `runSandboxed`: \<`T`\>(`sandboxedFunction`, `sandboxOptions`) => `Promise`\<`T`\>; \}\>

An object containing the runSandboxed function and the loaded module.
