import { expect } from 'chai'
// testRunner.ts
import type { HookFunction, Suite, SuiteResult, TestFunction } from './types.js'

/**
 * Root suite that contains all tests and nested suites.
 */
const rootSuite: Suite = {
	title: '',
	tests: [],
	beforeAll: [],
	afterAll: [],
	beforeEach: [],
	afterEach: [],
	suites: [],
}

let currentSuite = rootSuite
const DEFAULT_TESTRUN_TIMEOUT = 5000

/**
 * Defines a test suite with a given title.
 * @param title - The title of the test suite.
 * @param fn - A function that defines the suite's tests and nested suites.
 */
function describe(title: string, fn: () => void) {
	const suite: Suite = {
		title,
		tests: [],
		beforeAll: [],
		afterAll: [],
		beforeEach: [],
		afterEach: [],
		suites: [],
	}
	currentSuite.suites.push(suite)
	const previousSuite = currentSuite
	currentSuite = suite
	fn()
	currentSuite = previousSuite
}

/**
 * Defines a test with a given title.
 * @param title - The title of the test.
 * @param fn - A function that contains the test logic.
 */
function it(title: string, fn: TestFunction) {
	currentSuite.tests.push({ title, fn })
}

/**
 * Registers a beforeAll hook to be run once before all tests in the suite.
 * @param fn - A function that contains the hook logic.
 */
function beforeAll(fn: HookFunction) {
	currentSuite.beforeAll.push({ fn })
}

/**
 * Registers an afterAll hook to be run once after all tests in the suite.
 * @param fn - A function that contains the hook logic.
 */
function afterAll(fn: HookFunction) {
	currentSuite.afterAll.push({ fn })
}

/**
 * Registers a beforeEach hook to be run before each test in the suite.
 * @param fn - A function that contains the hook logic.
 */
function beforeEach(fn: HookFunction) {
	currentSuite.beforeEach.push({ fn })
}

/**
 * Registers an afterEach hook to be run after each test in the suite.
 * @param fn - A function that contains the hook logic.
 */
function afterEach(fn: HookFunction) {
	currentSuite.afterEach.push({ fn })
}

/**
 * Runs a function with a timeout.
 * @param fn - The function to run.
 * @param timeout - The timeout in milliseconds.
 * @returns A promise that resolves if the function completes in time, or rejects if it times out.
 */

// biome-ignore lint/complexity/noBannedTypes: <explanation>
async function runWithTimeout(fn: Function, timeout: number): Promise<void> {
	let timeoutHandle: ReturnType<typeof setTimeout> | undefined
	const res = await Promise.race([
		fn(),
		new Promise((_, reject) => {
			timeoutHandle = setTimeout(() => reject(new Error(`Timeout of ${timeout}ms exceeded`)), timeout)
		}),
	])

	if (timeoutHandle) {
		clearTimeout(timeoutHandle)
		timeoutHandle = undefined
	}
	return res
}

/**
 * Runs a suite and its tests, collecting results.
 * @param suite - The suite to run.
 * @param timeout - The timeout in milliseconds for hooks and tests.
 * @returns A promise that resolves to the results of the suite.
 */
async function runSuite(suite: Suite, timeout: number): Promise<SuiteResult> {
	const suiteResult: SuiteResult = {
		title: suite.title,
		beforeAll: [],
		beforeEach: [],
		tests: [],
		afterEach: [],
		afterAll: [],
		suites: [],
	}

	// Run beforeAll hooks
	for (const { fn } of suite.beforeAll) {
		try {
			await runWithTimeout(fn, timeout)
			suiteResult.beforeAll.push({
				title: 'beforeAll hook',
				passed: true,
			})
		} catch (error) {
			suiteResult.beforeAll.push({
				title: 'beforeAll hook',
				passed: false,
				error,
			})
		}
	}

	// Run tests and beforeEach/afterEach hooks
	for (const test of suite.tests) {
		for (const { fn } of suite.beforeEach) {
			try {
				await runWithTimeout(fn, timeout)
				suiteResult.beforeEach.push({
					title: 'beforeEach hook',
					passed: true,
				})
			} catch (error) {
				suiteResult.beforeEach.push({
					title: 'beforeEach hook',
					passed: false,
					error,
				})
			}
		}

		try {
			await runWithTimeout(test.fn, timeout)
			suiteResult.tests.push({
				title: test.title,
				passed: true,
			})
		} catch (error) {
			suiteResult.tests.push({
				title: test.title,
				passed: false,
				error,
			})
		}

		for (const { fn } of suite.afterEach) {
			try {
				await runWithTimeout(fn, timeout)
				suiteResult.afterEach.push({
					title: 'afterEach hook',
					passed: true,
				})
			} catch (error) {
				suiteResult.afterEach.push({
					title: 'afterEach hook',
					passed: false,
					error,
				})
			}
		}
	}

	// Run nested suites
	for (const subSuite of suite.suites) {
		const subSuiteResult = await runSuite(subSuite, timeout)
		suiteResult.suites.push(subSuiteResult)
	}

	// Run afterAll hooks
	for (const { fn } of suite.afterAll) {
		try {
			await runWithTimeout(fn, timeout)
			suiteResult.afterAll.push({
				title: 'afterAll hook',
				passed: true,
			})
		} catch (error) {
			suiteResult.afterAll.push({
				title: 'afterAll hook',
				passed: false,
				error,
			})
		}
	}

	return suiteResult
}

/**
 * Runs the root suite and returns the results.
 * @param timeout - The timeout in milliseconds for hooks and tests. Defaults to 5000ms.
 * @returns A promise that resolves to the results of the root suite.
 */
async function runTests(timeout: number = DEFAULT_TESTRUN_TIMEOUT): Promise<SuiteResult> {
	const result = await runSuite(rootSuite, timeout)
	return result
}
// Make functions globally available
globalThis.describe = describe
globalThis.it = it
globalThis.beforeAll = beforeAll
globalThis.afterAll = afterAll
globalThis.beforeEach = beforeEach
globalThis.afterEach = afterEach
globalThis.runTests = runTests
globalThis.expect = expect

export { describe, it, beforeAll, afterAll, beforeEach, afterEach, runTests, expect }
