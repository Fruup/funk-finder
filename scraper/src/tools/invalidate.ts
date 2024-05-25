/**
 * Invalidate a number of media items where the old OCR engine was used.
 */

import type { Db } from '@funk-finder/db'
import { getChroma, getPocketbase } from '../helpers/config'
import { readLine } from '../helpers/readLine'
import { parseArgs } from 'util'

if (import.meta.main) {
	const nString = parseArgs({ allowPositionals: true }).positionals.at(0)
	if (!nString) throw Error('No number provided')
	const n = parseInt(nString)
	if (isNaN(n) || n <= 0) throw Error('Invalid number provided')

	const pb = await getPocketbase()
	const { mediaCollection } = await getChroma()

	const media = (
		await pb.collection<Db.Medium<true>>('media').getFullList({
			filter: `extra.ocrEngine = null`,
			sort: '-created',
			fields: 'id',
		})
	).slice(0, n)

	console.log(`🚨 Invalidating ${media.length} media items.`)
	await readLine('Continue? (y/n)')

	// Update in PB.
	const ids: string[] = []

	for (const medium of media) {
		try {
			await pb.collection<Db.Medium>('media').update(medium.id, {
				processed: false,
			})

			// Add to the list of IDs to delete from chroma.
			ids.push(medium.id)
		} catch (e) {
			console.error('❌ Error updating medium', medium.id)
			console.error(e)
		}
	}

	// Delete from chroma.
	await mediaCollection.delete({ ids })
}
