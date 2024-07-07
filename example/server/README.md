## Server Example

The server example demonstrates how you can use [@sebastianwessel/quickjs](https://github.com/sebastianwessel/quickjs) inside a web server. In this example, we run a web server that spawns workers on request using the [poolifier-web-worker](https://github.com/poolifier/poolifier-web-worker) package. Each worker runs its own QuickJS sandbox and executes the given code.

You can test it out by running:

```sh
bun run example:server
```

from the root of this repository. Once the server has started, open your browser and go to [http://localhost:3000/](http://localhost:3000/). You will see a simple OpenAPI (Swagger) UI.