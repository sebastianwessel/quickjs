## [unreleased]

### 🐛 Bug Fixes

- Harden runtime cleanup and refresh deps

### 💼 Other

- Run tests serially per file to avoid bun runner timeouts

### 📚 Documentation

- Add security model and hardening guidance

### ⚙️ Miscellaneous Tasks

- Simplify release trigger and harden publish workflow
- Require main branch for release workflow
- Retry flaky per-file test execution once
- Align release workflow with npm and jsr trusted publishing docs
- Upgrade npm for trusted publisher releases
- Create github release and tag after publish
## [3.0.0] - 2025-07-26

### 📚 Documentation

- Add blog entry v3.0
- Fix minor doc issues
- Update doc
- Add api doc

### ⚙️ Miscellaneous Tasks

- Remove dependency
- Bump to version 3
## [2.3.1] - 2025-06-24

### ⚙️ Miscellaneous Tasks

- Lint
- Update packages
- Update linter deps
- Bump version
- Bump jsr version
## [2.3.0] - 2025-06-21

### 🚀 Features

- Improve node timers compatibility

### 📚 Documentation

- Update runtime and ts instructions

### ⚙️ Miscellaneous Tasks

- Bump jsr.json version
- Update packages
- Lint
- Fix lint
- Bump to version 2.3.0
- Update packages
## [2.2.0] - 2025-04-30

### 🐛 Bug Fixes

- Typing
- Typings
- WASM crash if env async function throws error #68

### 📚 Documentation

- Clarify executionTimeout is in milliseconds

### ⚙️ Miscellaneous Tasks

- Generate website in CI and add api docs
- Remove docs as they are now CI build
- Add docs build folder to git ignore
- Add build & test CI
- Bump dependencies
- Align test
- Cleanup code
- Improve typings
- Minor improvements
- Bump dependencies
## [2.1.1] - 2025-03-09

### 🐛 Bug Fixes

- SetTimeout 2nd parameter is optional #59
- Clear timeout in result promise on success #65

### 📚 Documentation

- Timeouts are in milliseconds not seconds fixes #61
- Correct documentation
- Update website

### ⚙️ Miscellaneous Tasks

- Bump jsr version
- Correct test file name
- Improve provideTimingFunctions
- Bump jsr version
## [2.1.0] - 2025-03-06

### 🐛 Bug Fixes

- Set executionTimeout for sandbox #57

### 📚 Documentation

- Add online playground
- Fix playground
- Update repo readme
- Cleanup and update docs
- Update website

### ⚙️ Miscellaneous Tasks

- Update np config
- Cleanup examples
- Improve error handling
- Improve tests
## [2.0.1] - 2025-02-28

### 🐛 Bug Fixes

- Fetch adapter response mapping

### 📚 Documentation

- Fix og image
- Fix og image
- Update doc and browser example

### ⚙️ Miscellaneous Tasks

- Bump jsr version
## [2.0.0] - 2025-02-27

### 🚀 Features

- Re-implement in new structure
- Handle function result and add example
- Add async module loader support
- Add node:events polyfill based on eventemitter3
- Make path normalizer configurable

### 🐛 Bug Fixes

- Timer functions and add example
- Fs promise

### 📚 Documentation

- Fix example
- Add documentation about platform support
- Add browser example and documentation
- Update doc
- Update browser example
- Update example
- Update example
- Fix example
- Fix example
- Fix typo
- Fix test doc
- Update docs and examples to new api
- Update readme
- Improve and add examples
- Extend basic example
- Add inline doc
- Setup vitepress for new website
- Update doc
- Add instruction to install quickjs wasm
- Add example for async usage with esm.sh module loading
- Update documentation
- New website #49
- Update documentation

### ⚙️ Miscellaneous Tasks

- Update example
- Update doc
- Bump packages
- Remove QuickJS-emscripten-sync dependency #34
- Implement new api
- Update examples
- Bump versions
- Mark old api as deprecated
- Cleanup
- Update tests
- Bump packages
- Remove config flag
- Enable test
- Remove tests from deprecated code
- Remove test for deprecated functions
- Use np for release and publish
- Fix lint
- Improve build step
- Cleanup examples
- Bump packages
- Correct function handling and add tests
- Add examples
- Minor improvements and fixes
- Update project settings
- Cleanup and remove v1.x code
- Bump deps
- Update npmignore
- Improve mapping
- Update tsconfig.json
- Update lint config
- Add package-lock.json
- Update jsr.json to pre-release version
- Fix browser example
- Set package version to v2 pre-release
- Re-organize and add tests
- Cleanup code
- Exclude docs from lint
- Update project config
- Fix build
- Bump jsr version
## [1.3.0] - 2024-07-11

### 🚀 Features

- Add compileOnly functionality #16
- Typescript support - Run Typescript in the QuickJS sandbox #20
- Improve customization #19
- Extend test runner result with summary and global passed flag #17
- Improve setTimeout and setInterval #7

### ⚙️ Miscellaneous Tasks

- Cleanup
- Improve node compatibility #14
- Cleanup
- Make Buffer and TextDecoder and TextEncoder global
- Bump to v1.3
## [1.2.0] - 2024-07-09

### 🚀 Features

- Improve custom virtual file system and module loader to allow relative imports #8

### 💼 Other

- Testrunner does not return the Errors in the response #11

### ⚙️ Miscellaneous Tasks

- Bump to version 1.2
## [1.1.1] - 2024-07-08

### 🐛 Bug Fixes

- Add missing type declaration

### ⚙️ Miscellaneous Tasks

- Bump version to 1.1.0
## [1.1.0] - 2024-07-08

### 🚀 Features

- Abstract the fetch client #1

### 🐛 Bug Fixes

- Custom node module handling and types

### 📚 Documentation

- Extend documentation
- Update
- Add documentation
- Add custom module example

### ⚙️ Miscellaneous Tasks

- Remove debug logs
## [1.0.0] - 2024-07-07

### 🚀 Features

- Add implementation
- Improve compatibility
- Implement timeout handling

### 🐛 Bug Fixes

- Testrunner timeouts

### 📚 Documentation

- Update doc
- Create structure
- Update doc
- Update doc
- Update doc
- Update

### ⚙️ Miscellaneous Tasks

- Initial commit
- Cleanup and add docu
- Cleanup
- Update gitignore
- Improve code
- Add test runner and prepare doc
- Add vendor to tshy exclude
- Update doc
- Update
- Update credits
