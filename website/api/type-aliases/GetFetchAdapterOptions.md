[**@sebastianwessel/quickjs v2.3.1**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / GetFetchAdapterOptions

# Type Alias: GetFetchAdapterOptions

> **GetFetchAdapterOptions** = `object`

Defined in: [adapter/fetch.ts:12](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L12)

Options for creating the default fetch adapter

## Properties

### allowedCorsOrigins?

> `optional` **allowedCorsOrigins**: `string`[]

Defined in: [adapter/fetch.ts:44](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L44)

List of allowed CORS origins

#### Default

```ts
['*']
```

***

### allowedHosts?

> `optional` **allowedHosts**: `string`[]

Defined in: [adapter/fetch.ts:20](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L20)

List of allowed hosts. If set, only these hosts are allowed to call

***

### allowedProtocols?

> `optional` **allowedProtocols**: `string`[]

Defined in: [adapter/fetch.ts:24](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L24)

List of allowed protocols. If set, only these protocols are allowed to call

***

### corsCheck?

> `optional` **corsCheck**: `boolean`

Defined in: [adapter/fetch.ts:39](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L39)

Flag to enable CORS policy check

#### Default

```ts
false
```

***

### disallowedHosts?

> `optional` **disallowedHosts**: `string`[]

Defined in: [adapter/fetch.ts:29](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L29)

List of disallowed hosts. If set, these hosts are not allowed to call

#### Default

```ts
['localhost', '127.0.0.1']
```

***

### fs?

> `optional` **fs**: `IFs`

Defined in: [adapter/fetch.ts:16](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L16)

The virtual file system of the sandbox (excludes node_modules)

***

### rateLimitDuration?

> `optional` **rateLimitDuration**: `number`

Defined in: [adapter/fetch.ts:54](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L54)

Duration in seconds for the rate limit

#### Default

```ts
1
```

***

### rateLimitPoints?

> `optional` **rateLimitPoints**: `number`

Defined in: [adapter/fetch.ts:49](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L49)

Number of requests allowed in the specified duration

#### Default

```ts
10
```

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [adapter/fetch.ts:34](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L34)

Timeout for fetch requests in milliseconds

#### Default

```ts
5000
```
