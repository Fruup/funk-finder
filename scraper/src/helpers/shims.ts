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
