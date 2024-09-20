---
title: Running tests in the sandbox
description: A guide for using the test library to write and run tests for JavaScript code with Chai's `expect` syntax.
---


The test is a lightweight testing library that allows you to write and run tests for JavaScript code with ease. It provides a simple interface for defining test suites, tests, and hooks with support for asynchronous code and configurable timeouts. The library also includes Chai's `expect` function for assertions.

### Importing the Library

To use the test library in your tests, you need to import it. You also need to ensure that the result of `runTests` is exported.

```javascript
import 'test'
```

### Writing Tests

#### Defining a Test Suite

A test suite is defined using the `describe` function. Inside a test suite, you can define multiple tests using the `it` function.

```javascript
describe('Sample Test Suite', () => {
  it('should pass this test', () => {
    expect(true).to.be.true;
  });

  it('should fail this test', () => {
    expect(false).to.be.true;
  });
});
```

#### Using Hooks

Hooks are functions that run before or after tests in a suite. The available hooks are:

- `beforeAll`: Runs once before all tests in the suite.
- `afterAll`: Runs once after all tests in the suite.
- `beforeEach`: Runs before each test in the suite.
- `afterEach`: Runs after each test in the suite.

```javascript
describe('Test Suite with Hooks', () => {
  beforeAll(() => {
    // Runs once before all tests
    console.log('Running beforeAll hook');
  });

  afterAll(() => {
    // Runs once after all tests
    console.log('Running afterAll hook');
  });

  beforeEach(() => {
    // Runs before each test
    console.log('Running beforeEach hook');
  });

  afterEach(() => {
    // Runs after each test
    console.log('Running afterEach hook');
  });

  it('should pass this test', () => {
    expect(true).to.be.true;
  });

  it('should fail this test', () => {
    expect(false).to.be.true;
  });
});
```

#### Asynchronous Tests and Hooks

The test supports asynchronous tests and hooks. Simply return a promise or use async/await in your test or hook functions.

```javascript
describe('Asynchronous Test Suite', () => {
  beforeAll(async () => {
    // Async beforeAll hook
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Running async beforeAll hook');
  });

  it('should pass this async test', async () => {
    const result = await new Promise(resolve => setTimeout(() => resolve(true), 1000));
    expect(result).to.be.true;
  });
});
```

### Using Chai's `expect`

The test includes Chai's `expect` function for writing assertions in your tests. The `expect` function is part of Chai's BDD (Behavior-Driven Development) interface. You can learn more about Chai's `expect` function and its usage at the [Chai documentation](https://www.chaijs.com/api/bdd/).

#### Examples of `expect` Usage

Here are some examples of using Chai's `expect` function in your tests:

##### Basic Assertions

```javascript
it('should assert true is true', () => {
  expect(true).to.be.true;
});

it('should assert equality', () => {
  expect(1 + 1).to.equal(2);
});
```

##### Testing Objects

```javascript
it('should assert object properties', () => {
  const obj = { a: 1, b: 2 };
  expect(obj).to.have.property('a').that.equals(1);
});
```

##### Testing Arrays

```javascript
it('should assert array contents', () => {
  const arr = [1, 2, 3];
  expect(arr).to.include.members([1, 2]);
});
```

### Running Tests

To run the tests, you need to call `runTests` and export the result. You can specify a custom timeout for tests and hooks by passing the timeout value in milliseconds as an argument to `runTests`.

```javascript
import 'test'

describe('Sample Test Suite', () => {
  it('should pass this test', () => {
    expect(true).to.be.true;
  });

  it('should fail this test', () => {
    expect(false).to.be.true;
  });
});

export default await runTests();
```

#### Custom Timeout

You can set a custom timeout for all tests and hooks in the suite by passing the timeout value to `runTests`.

```javascript
import 'test'

describe('Sample Test Suite with Custom Timeout', () => {
  it('should pass this test', () => {
    expect(true).to.be.true;
  });

  it('should fail this test', () => {
    expect(false).to.be.true;
  });
});

export default await runTests(10000); // Set timeout to 10 seconds
```

### Example Usage

Here is an example demonstrating the complete setup and usage of the test library.

```javascript
import 'test'

describe('Example Test Suite', () => {
  beforeAll(() => {
    console.log('Running global beforeAll hook');
  });

  afterAll(() => {
    console.log('Running global afterAll hook');
  });

  beforeEach(() => {
    console.log('Running global beforeEach hook');
  });

  afterEach(() => {
    console.log('Running global afterEach hook');
  });

  describe('Nested Suite', () => {
    beforeAll(() => {
      console.log('Running nested beforeAll hook');
    });

    it('should pass this test', () => {
      expect(true).to.be.true;
    });

    it('should fail this test', () => {
      expect(false).to.be.true;
    });
  });

  it('should pass this test outside nested suite', () => {
    expect(1 + 1).to.equal(2);
  });
});

export default await runTests();
```

### Conclusion

The test library provides a straightforward way to define and run tests for your JavaScript code. With support for asynchronous operations, configurable timeouts, and Chai's `expect` function for assertions, you can ensure that your tests are robust and reliable. Happy testing!
