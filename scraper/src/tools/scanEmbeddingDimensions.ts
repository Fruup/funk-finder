import { IncludeEnum, type IDs } from 'chromadb'
import { getChroma } from '../helpers/config'
import { Timing } from '../helpers/timing'
import '../helpers/shims'

const { mediaCollection } = await getChroma()

const numItems = await mediaCollection.count()
console.info(`📊 Scanning dimensions of ${numItems} items...`)

const dimensionMap = new Map<number, IDs>()
const pageSize = 1000
const timing = new Timing(numItems)

for (let offset = 0; offset < numItems; offset += pageSize) {
	const items = await mediaCollection.get({
		where: {},
		offset,
		limit: pageSize,
		include: [IncludeEnum.Embeddings],
	})

	for (let i = 0; i < items.ids.length; i++) {
		const id = items.ids[i]
		const dimensions = items.embeddings[i].length

		dimensionMap.set(dimensions, (dimensionMap.get(dimensions) || []).concat(id))
	}

	timing.update(offset)
}

// Output result.

console.table(
	Object.fromEntries(
		Array.from(dimensionMap.entries()).map(([dimensions, ids]) => [dimensions, ids.length]),
	),
)
