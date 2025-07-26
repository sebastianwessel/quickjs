[**@sebastianwessel/quickjs v2.3.1**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / SandboxEvalCode

# Type Alias: SandboxEvalCode()\<T\>

> **SandboxEvalCode**\<`T`\> = (`code`, `filename?`, `options?`) => `Promise`\<[`OkResponse`](OkResponse.md)\<`T`\> \| [`ErrorResponse`](ErrorResponse.md)\>

Defined in: [types/SandboxEvalCode.ts:6](https://github.com/sebastianwessel/quickjs/blob/main/src/types/SandboxEvalCode.ts#L6)

## Type Parameters

### T

`T` = `unknown`

## Parameters

### code

`string`

### filename?

`string`

### options?

[`Prettify`](Prettify.md)\<`Omit`\<`ContextEvalOptions`, `"type"`\>\>

## Returns

`Promise`\<[`OkResponse`](OkResponse.md)\<`T`\> \| [`ErrorResponse`](ErrorResponse.md)\>
