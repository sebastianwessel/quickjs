import { beforeAll, describe, expect, it } from 'bun:test'
import { loadQuickJs } from '../loadQuickJs.js'
import type { OkResponse } from '../types/OkResponse.js'

describe('env data exchange', () => {
	let runtime: Awaited<ReturnType<typeof loadQuickJs>>

	beforeAll(async () => {
		runtime = await loadQuickJs()
	})

	it('can exchange numbers', async () => {
		const code = `
    const result = {
      before: env.getNumber()
    }

    env.setNumber(10)

    result.after = env.getNumber()

    export default result
    `

		let num = 5

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
			env: {
				getNumber: () => num,
				setNumber: (val: number) => {
					num = val
				},
			},
		})

		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toEqual({ before: 5, after: 10 })
	})

	it('can exchange string', async () => {
		const code = `
    const result = {
      before: env.getString()
    }

    env.setString('added')

    result.after = env.getString()

    export default result
    `

		let str = 'init'

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
			env: {
				getString: () => str,
				setString: (val: string) => {
					str = val
				},
			},
		})

		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toEqual({ before: 'init', after: 'added' })
	})

	it('can exchange array', async () => {
		const code = `
    const result = {
      before: env.getArray()
    }

    env.setArray(['added'])

    result.after = env.getArray()

    export default result
    `

		let arr = ['init']

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
			env: {
				getArray: () => arr,
				setArray: (val: string[]) => {
					arr = val
				},
			},
		})

		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toEqual({ before: ['init'], after: ['added'] })
	})

	it('can exchange date', async () => {
		const code = `
    const result = {
      before: env.getDate()
    }

    env.setDate(new Date(1740575767000))

    result.after = env.getDate()

    export default result
    `

		let d = new Date(1740575765115)

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
			env: {
				getDate: () => d,
				setDate: (val: Date) => {
					d = val
				},
			},
		})

		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toEqual({ before: new Date(1740575765115), after: new Date(1740575767000) })
	})

	it('can exchange object', async () => {
		const code = `
    const result = {
      before: env.getObject()
    }

    env.setObject({
				num: 2,
				str: 'hello 2',
				date: new Date(1740575765115),
				obj: {
					str: 'world 2',
					num: 3,
					arr: ['four', 'five', 'six'],
				},
				arr: [4, 5, 6],
			})

    result.after = env.getObject()

    export default result
    `

		let obj: Record<string, any> = {
			num: 1,
			str: 'hello',
			date: new Date(1740575767000),
			obj: {
				str: 'world',
				num: 2,
				arr: ['one', 'two', 'three'],
			},
			arr: [1, 2, 3],
		}

		const result = await runtime.runSandboxed(async ({ evalCode }) => evalCode(code), {
			env: {
				getObject: () => obj,
				setObject: (val: Record<string, any>) => {
					obj = val
				},
			},
		})

		expect(result.ok).toBeTrue()
		expect((result as OkResponse).data).toEqual({
			before: {
				num: 1,
				str: 'hello',
				date: new Date(1740575767000),
				obj: {
					str: 'world',
					num: 2,
					arr: ['one', 'two', 'three'],
				},
				arr: [1, 2, 3],
			},
			after: {
				num: 2,
				str: 'hello 2',
				date: new Date(1740575765115),
				obj: {
					str: 'world 2',
					num: 3,
					arr: ['four', 'five', 'six'],
				},
				arr: [4, 5, 6],
			},
		})
	})
})
