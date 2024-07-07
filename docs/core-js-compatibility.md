---
title: Core JavaScript Compatibility
description: The QuickJS sandbox has build in compatibility for the basic NodeJS/Javascript functions
---

- ✅ mostly [ES2023](https://test262.fyi/#%7Cqjs,qjs_ng)
- ✅ ESM import support (custom modules supported)
- ✅ top-level await

## Supported Methods

| Method                 | Supported |
|------------------------|-----------|
| `process.env`          | ✅ (customizable) |
| `console.log`          | ✅ (customizable) |
| `console.error`        | ✅ (customizable) |
| `console.warn`         | ✅ (customizable) |
| `console.info`         | ✅ (customizable) |
| `console.debug`        | ✅ (customizable) |
| `console.trace`        | ✅ (customizable) |
| `console.assert`       | ✅ (customizable) |
| `console.count`        | ✅ (customizable) |
| `console.countReset`   | ✅ (customizable) |
| `console.dir`          | ✅ (customizable) |
| `console.dirxml`       | ✅ (customizable) |
| `console.group`        | ✅ (customizable) |
| `console.groupCollapsed` | ✅ (customizable) |
| `console.groupEnd`     | ✅ (customizable) |
| `console.table`        | ✅ (customizable) |
| `console.time`         | ✅ (customizable) |
| `console.timeEnd`      | ✅ (customizable) |
| `console.timeLog`      | ✅ (customizable) |
| `console.clear`        | ✅ (customizable) |
| `setTimeout`           | ✅ |
| `clearTimeout`         | ✅ |
| `setInterval`          | ✅ |
| `clearInterval`        | ✅ |
| `fetch`                | ✅ (set `allowFetch=true`) |

This documentation provides a comprehensive overview of the core JavaScript methods and their compatibility with the given environment. Each method listed above is supported, ensuring robust functionality and flexibility for development. 

For more information, refer to the [ES2023 compatibility tests](https://test262.fyi/#%7Cqjs,qjs_ng).
