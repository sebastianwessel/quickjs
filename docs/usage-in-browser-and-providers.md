---
title: sage in browser and on Providers
description: Use the QuickJS library in browser an on platform providers
---

## Usage in Browser

Here is the most minimal example on how to use this library in the browser.
You need to ensure, that the webassembly file can be loaded correctly. Therefore, you need to add this as parameter to the `quickJS` call.

Using `fetch`is possible, but there are the same restrictions as in any other browser usage (CORS & co).

```html
<!doctype html>
<!-- Import from a ES Module CDN -->
<script type="module">

  import { quickJS } from "https://esm.sh/@sebastianwessel/quickjs@1.3.0"

  const {createRuntime} = await quickJS('https://esm.sh/@jitl/quickjs-wasmfile-release-sync')

  const { evalCode } = await createRuntime({
    allowFetch: true,
    fetchAdapter: (...params)=>fetch(...params)
    env: {
      MY_ENV_VAR: 'env var value',
    },
  })

  console.log(await evalCode("export default 1+1"))
</script>
```

## Cloudflare Workers

Cloudflare workers have some limitations regarding bundling. The developers of the underlaying quickjs-emscripten library, already solved this.

[github.com/justjake/quickjs-emscripten/tree/main/examples/cloudflare-workers](https://github.com/justjake/quickjs-emscripten/tree/main/examples/cloudflare-workers)

This library will be aligned soon, to support cloudflare as well.
