# QuickJS Examples

Here are some examples on how you can use **[@sebastianwessel/quickjs](https://github.com/sebastianwessel/quickjs)**.

The examples are intended to run in [Bun](https://bun.sh), but can be easily adapted to run on other runtimes.

## Installation

Before running any of the examples, ensure you have installed all necessary modules by running:

```sh
bun i
```

## Basic Example

This is a basic example of how to use [@sebastianwessel/quickjs](https://github.com/sebastianwessel/quickjs). You can test it out by running:

```sh
bun run example:basic
```

from the root of this repository.

## Server Example

The server example demonstrates how you can use [@sebastianwessel/quickjs](https://github.com/sebastianwessel/quickjs) inside a web server. In this example, we run a web server that spawns workers on request using the [poolifier-web-worker](https://github.com/poolifier/poolifier-web-worker) package. Each worker runs its own QuickJS sandbox and executes the given code.

You can test it out by running:

```sh
bun run example:server
```

from the root of this repository. Once the server has started, open your browser and go to [http://localhost:3000/](http://localhost:3000/). You will see a simple OpenAPI (Swagger) UI.

## Run-Tests Example

In the *run-tests* example, the usage of the included test runner is shown. You can test it out by running:

```sh
bun run example:test
```

from the root of this repository.
