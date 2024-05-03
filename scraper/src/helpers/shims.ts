/**
 * Shims for Bun.
 * - `console.table`
 *
 * https://github.com/oven-sh/bun/issues/802#issuecomment-1744049793
 */

import { Console } from 'console'
import { Transform } from 'stream'

const ts = new Transform({
	transform(chunk, _, cb) {
		cb(null, chunk)
	},
})

const logger = new Console({ stdout: ts })

function getTable(data: any) {
	logger.table(data)
	const table = (ts.read() || '').toString()
	console.log(table)
}

console.table = getTable

declare global {
	interface Array<T> {
		forEachAsync(callback: (value: T, index: number, array: T[]) => any): Promise<void>

		mapCollectAsync<CallbackResult>(
			callback: (value: T, index: number, array: T[]) => Promise<CallbackResult>,
		): Promise<Exclude<CallbackResult, null | undefined>[]>

		collect(): Exclude<T, null | undefined>[]
	}
}

Array.prototype.forEachAsync = async function (callback) {
	const results = await Promise.allSettled(this.map(callback))

	results.forEach((promise) => {
		if (promise.status === 'rejected') {
			console.error(promise.reason)
		}
	})
}

Array.prototype.mapCollectAsync = async function (callback) {
	const results = await Promise.allSettled(this.map(callback))

	return results
		.map((promise) => {
			if (promise.status === 'rejected') {
				console.error(promise.reason)
				return null
			}

			return promise.value
		})
		.collect()
}

Array.prototype.collect = function <T>() {
	return this.filter((item): item is Exclude<T, null | undefined> => item != null)
}
