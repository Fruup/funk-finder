import type { Db } from '@funk-finder/db'
import { getChroma, getPocketbase } from '../helpers/config'

if (import.meta.main) {
	const pb = await getPocketbase()
	const { mediaCollection } = await getChroma()

	// Unprocessed media.
	{
		const media = await pb.collection<Db.Medium<true>>('media').getFullList({
			filter: `processed = false`,
			fields: 'id',
		})

		if (media.length > 0) {
			console.log(`🚨 Unprocessed media: ${media.length}`)
		} else {
			console.log('✅ All media processed.')
		}
	}

	// Item count mismatch.
	{
		const media = await pb.collection<Db.Medium<true>>('media').getFullList({
			filter: `processed = true && text != null`,
			fields: 'id',
		})

		const posts = await pb.collection<Db.Post<true>>('posts').getFullList({
			filter: `caption != null`,
			fields: 'id',
		})

		const chromaLength = await mediaCollection.count()

		console.log(`📊 Total media (PB): ${media.length}`)
		console.log(`📊 Total posts (PB): ${posts.length}`)
		console.log(`📊 Total items (Chroma): ${chromaLength}`)

		if (chromaLength !== media.length + posts.length) {
			console.log(
				`🚨 Item counts do not match: ${media.length} [PB media] + ${posts.length} [PB [posts]] != ${chromaLength} [Chroma].`,
			)

			// Find missing and superfluous items.
			const { ids: chromaIds } = await mediaCollection.get({})
			const pbIds = [...media.map(({ id }) => id), ...posts.map(({ id }) => id)]

			if (chromaIds.length !== new Set(chromaIds).size) {
				console.log('🚨 Chroma IDs are not unique.')
			}

			const missing = pbIds.filter((id) => !chromaIds.includes(id))
			const superfluous = chromaIds.filter((id) => !pbIds.includes(id))

			const missingStr = JSON.stringify(missing)
			if (missing.length > 1000) {
				console.log('+', "[see 'missing.json']")
				Bun.write('missing.json', missingStr)
			} else console.log('+', JSON.stringify(missing))

			const superfluousStr = JSON.stringify(superfluous)
			if (superfluous.length > 1000) {
				console.log('-', "[see 'superfluous.json']")
				Bun.write('superfluous.json', superfluousStr)
			} else console.log('-', JSON.stringify(superfluous))
		} else {
			console.log('✅ Item counts match.')
		}
	}

	// OCR engine.
	{
		const media = await pb.collection<Db.Medium<true>>('media').getFullList({
			filter: `processed = true && text != null`,
			fields: 'extra',
		})

		const wrongCount = media.filter(({ extra }) => extra?.ocrEngine !== 'google')

		if (wrongCount.length > 0) {
			console.log(`🚨 Wrong OCR engine (not 'google'): ${wrongCount.length}`)
		} else {
			console.log('✅ Correct OCR engine.')
		}
	}

	console.log('All checks executed 🎉')
}
