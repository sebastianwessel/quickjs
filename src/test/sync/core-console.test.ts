import { beforeAll, describe, expect, it, mock } from 'bun:test'
import { loadQuickJs } from '../../loadQuickJs.js'
import type { OkResponse } from '../../types/OkResponse.js'
import type { SandboxOptions } from '../../types/SandboxOptions.js'

describe('core - console', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	it('console.log works correctly', async () => {
		const logSpy = mock()

		const code = `
      console.log('Test log')
      export default 'logged'
    `

		const options: SandboxOptions = { console: { log: logSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('logged')
		expect(logSpy).toHaveBeenCalledWith('Test log')
	})

	it('console.error works correctly', async () => {
		const errorSpy = mock()

		const code = `
      console.error('Test error')
      export default 'errored'
    `

		const options: SandboxOptions = { console: { error: errorSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('errored')
		expect(errorSpy).toHaveBeenCalledWith('Test error')
	})

	it('console.warn works correctly', async () => {
		const warnSpy = mock()

		const code = `
      console.warn('Test warn')
      export default 'warned'
    `

		const options: SandboxOptions = { console: { warn: warnSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('warned')
		expect(warnSpy).toHaveBeenCalledWith('Test warn')
	})

	it('console.info works correctly', async () => {
		const infoSpy = mock()

		const code = `
      console.info('Test info')
      export default 'infoed'
    `

		const options: SandboxOptions = { console: { info: infoSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('infoed')
		expect(infoSpy).toHaveBeenCalledWith('Test info')
	})

	it('console.debug works correctly', async () => {
		const debugSpy = mock()

		const code = `
      console.debug('Test debug')
      export default 'debugged'
    `

		const options: SandboxOptions = { console: { debug: debugSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('debugged')
		expect(debugSpy).toHaveBeenCalledWith('Test debug')
	})

	it('console.trace works correctly', async () => {
		const traceSpy = mock()

		const code = `
      console.trace('Test trace')
      export default 'traced'
    `

		const options: SandboxOptions = { console: { trace: traceSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('traced')
		expect(traceSpy).toHaveBeenCalled()
	})

	it('console.assert works correctly', async () => {
		const assertSpy = mock()

		const code = `
      console.assert(false, 'Test assert')
      export default 'asserted'
    `

		const options: SandboxOptions = { console: { assert: assertSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('asserted')
		expect(assertSpy).toHaveBeenCalledWith(false, 'Test assert')
	})

	it('console.count works correctly', async () => {
		const countSpy = mock()

		const code = `
      console.count('Test count')
      console.count('Test count')
      export default 'counted'
    `

		const options: SandboxOptions = { console: { count: countSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('counted')
		expect(countSpy).toHaveBeenCalledTimes(2)
	})

	it('console.dir works correctly', async () => {
		const dirSpy = mock()

		const code = `
      console.dir({ key: 'value' })
      export default 'dir'
    `

		const options: SandboxOptions = { console: { dir: dirSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('dir')
		expect(dirSpy).toHaveBeenCalledWith({ key: 'value' })
	})

	it('console.group works correctly', async () => {
		const groupSpy = mock()
		const groupEndSpy = mock()

		const code = `
      console.group('Test group')
      console.log('Inside group')
      console.groupEnd('Test group')
      export default 'grouped'
    `

		const options: SandboxOptions = { console: { group: groupSpy, groupEnd: groupEndSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('grouped')
		expect(groupSpy).toHaveBeenCalledWith('Test group')
		expect(groupEndSpy).toHaveBeenCalled()
	})

	it('console.table works correctly', async () => {
		const tableSpy = mock()

		const code = `
      console.table([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }])
      export default 'tabled'
    `

		const options: SandboxOptions = { console: { table: tableSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('tabled')
		expect(tableSpy).toHaveBeenCalledWith([
			{ a: 1, b: 'Y' },
			{ a: 'Z', b: 2 },
		])
	})

	it('console.time and console.timeEnd work correctly', async () => {
		const timeSpy = mock()
		const timeEndSpy = mock()

		const code = `
      console.time('Test timer')
      console.timeEnd('Test timer')
      export default 'timed'
    `

		const options: SandboxOptions = { console: { time: timeSpy, timeEnd: timeEndSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('timed')
		expect(timeSpy).toHaveBeenCalledWith('Test timer')
		expect(timeEndSpy).toHaveBeenCalledWith('Test timer')
	})

	it('console.clear works correctly', async () => {
		const clearSpy = mock()

		const code = `
      console.clear()
      export default 'cleared'
    `

		const options: SandboxOptions = { console: { clear: clearSpy } }
		const result = await runtime.runSandboxed(async ({ evalCode }) => {
			return (await evalCode(code)) as OkResponse
		}, options)

		expect(result.ok).toBeTrue()
		expect(result.data).toBe('cleared')
		expect(clearSpy).toHaveBeenCalled()
	})
})
