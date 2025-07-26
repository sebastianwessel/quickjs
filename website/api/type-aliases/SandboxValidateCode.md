[**@sebastianwessel/quickjs v2.3.1**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / SandboxValidateCode

# Type Alias: SandboxValidateCode()

> **SandboxValidateCode** = (`code`, `filename?`, `options?`) => `Promise`\<[`OkResponseCheck`](OkResponseCheck.md) \| [`ErrorResponse`](ErrorResponse.md)\>

Defined in: [types/SandboxValidateCode.ts:6](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxValidateCode.ts#L6)

## Parameters

### code

`string`

### filename?

`string`

### options?

[`Prettify`](Prettify.md)\<`Omit`\<`ContextEvalOptions`, `"type"`\> & `object`\>

## Returns

`Promise`\<[`OkResponseCheck`](OkResponseCheck.md) \| [`ErrorResponse`](ErrorResponse.md)\>
