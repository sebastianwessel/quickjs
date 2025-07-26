[**@sebastianwessel/quickjs v2.3.1**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / getTypescriptSupport

# Function: getTypescriptSupport()

> **getTypescriptSupport**(`enabled`, `typescriptImportFile?`, `options?`): `Promise`\<\{ `transpileFile`: (`value`, `_compilerOptions?`, `_fileName?`, `_diagnostics?`, `_moduleName?`) => `string`; `transpileNestedDirectoryJSON`: (`mountFsJson`, `_option?`) => `NestedDirectoryJSON`; `transpileVirtualFs`: (`fs`, `_options?`) => `IFs`; \}\>

Defined in: [getTypescriptSupport.ts:18](https://github.com/sebastianwessel/quickjs/blob/main/src/getTypescriptSupport.ts#L18)

Add support for handling typescript files and code.
Requires the optional dependency 'typescript'.

## Parameters

### enabled

`boolean` = `false`

### typescriptImportFile?

`string`

### options?

`CompilerOptions`

## Returns

`Promise`\<\{ `transpileFile`: (`value`, `_compilerOptions?`, `_fileName?`, `_diagnostics?`, `_moduleName?`) => `string`; `transpileNestedDirectoryJSON`: (`mountFsJson`, `_option?`) => `NestedDirectoryJSON`; `transpileVirtualFs`: (`fs`, `_options?`) => `IFs`; \}\>
