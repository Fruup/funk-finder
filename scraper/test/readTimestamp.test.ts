import { test, expect } from 'bun:test'
import { readTimeStamp } from '../src/collect'

test('works', () => {
	const result = readTimeStamp('2020-02-04_23-46-25_UTC.json')
	expect(result).toBeNumber()
	expect(result).toEqual(Date.UTC(2020, 1, 4, 23, 46, 25, 0))
})
