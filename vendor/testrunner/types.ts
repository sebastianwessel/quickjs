// testTypes.ts

/**
 * Represents a test function that can be synchronous or asynchronous.
 */
export type TestFunction = () => void | Promise<void>

/**
 * Represents a hook function that can be synchronous or asynchronous.
 */
export type HookFunction = () => void | Promise<void>

/**
 * Represents a test with its title and function.
 */
export interface Test {
	title: string
	fn: TestFunction
}

/**
 * Represents a hook with its function.
 */
export interface Hook {
	fn: HookFunction
}

/**
 * Represents the result of an individual hook execution.
 */
export interface HookResult {
	title: string // The title or description of the hook.
	passed: boolean // Indicates whether the hook passed or failed.
	error?: any // An optional error object if the hook failed.
}

/**
 * Represents the result of an individual test execution.
 */
export interface TestResult {
	title: string // The title or description of the test.
	passed: boolean // Indicates whether the test passed or failed.
	error?: any // An optional error object if the test failed.
}

/**
 * Represents the result of a test suite execution, including its hooks, tests, and nested suites.
 */
export interface SuiteResult {
	title: string // The title or description of the suite.
	beforeAll: HookResult[] // Results of beforeAll hooks.
	beforeEach: HookResult[] // Results of beforeEach hooks.
	tests: TestResult[] // Results of individual tests.
	afterEach: HookResult[] // Results of afterEach hooks.
	afterAll: HookResult[] // Results of afterAll hooks.
	suites: SuiteResult[] // Results of nested suites.
}

/**
 * Represents a test suite, including its hooks, tests, and nested suites.
 */
export interface Suite {
	title: string // The title or description of the suite.
	tests: Test[] // Array of test functions in the suite.
	beforeAll: Hook[] // Array of beforeAll hooks.
	afterAll: Hook[] // Array of afterAll hooks.
	beforeEach: Hook[] // Array of beforeEach hooks.
	afterEach: Hook[] // Array of afterEach hooks.
	suites: Suite[] // Array of nested suites.
}
