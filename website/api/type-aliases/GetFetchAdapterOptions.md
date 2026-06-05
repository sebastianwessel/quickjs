[**@sebastianwessel/quickjs v3.0.1**](../README.md)

***

[@sebastianwessel/quickjs](../globals.md) / GetFetchAdapterOptions

# Type Alias: GetFetchAdapterOptions

> **GetFetchAdapterOptions** = `object`

Defined in: [adapter/fetch.ts:15](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L15)

Options for creating the default fetch adapter

## Properties

### allowedCorsOrigins?

> `optional` **allowedCorsOrigins?**: `string`[]

Defined in: [adapter/fetch.ts:47](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L47)

List of allowed CORS origins

#### Default

```ts
['*']
```

***

### allowedHosts?

> `optional` **allowedHosts?**: `string`[]

Defined in: [adapter/fetch.ts:23](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L23)

List of allowed hosts. If set, only these hosts are allowed to call

***

### allowedProtocols?

> `optional` **allowedProtocols?**: `string`[]

Defined in: [adapter/fetch.ts:27](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L27)

List of allowed protocols. If set, only these protocols are allowed to call

***

### corsCheck?

> `optional` **corsCheck?**: `boolean`

Defined in: [adapter/fetch.ts:42](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L42)

Flag to enable CORS policy check

#### Default

```ts
false
```

***

### disallowedHosts?

> `optional` **disallowedHosts?**: `string`[]

Defined in: [adapter/fetch.ts:32](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L32)

List of disallowed hosts. If set, these hosts are not allowed to call

#### Default

```ts
['localhost', '127.0.0.1']
```

***

### fs?

> `optional` **fs?**: `IFs`

Defined in: [adapter/fetch.ts:19](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L19)

The virtual file system of the sandbox (excludes node_modules)

***

### rateLimitDuration?

> `optional` **rateLimitDuration?**: `number`

Defined in: [adapter/fetch.ts:57](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L57)

Duration in seconds for the rate limit

#### Default

```ts
1
```

***

### rateLimitPoints?

> `optional` **rateLimitPoints?**: `number`

Defined in: [adapter/fetch.ts:52](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L52)

Number of requests allowed in the specified duration

#### Default

```ts
10
```

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [adapter/fetch.ts:37](https://github.com/sebastianwessel/quickjs/blob/main/src/adapter/fetch.ts#L37)

Timeout for fetch requests in milliseconds

#### Default

```ts
5000
```
