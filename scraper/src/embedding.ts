import type * as Db from '@funk-finder/db/types/models'
import { Timing } from './helpers/timing'
import { readLine } from './helpers/readLine'
import { getChroma, getPocketbase } from './helpers/config'

const production = process.env.NODE_ENV === 'production'

export async function createEmbeddings() {
	// Add media to chroma db.
	const { mediaCollection } = await getChroma()

	console.log(`💡 Media collection contains ${await mediaCollection.count()} item(s).`)

	const pb = await getPocketbase()

	const ids: string[] = []
	const documents: string[] = []
	const metadatas: { type: 'medium' | 'post' }[] = []

	// insert media
	const media = await pb.collection<Db.Medium<true>>('media').getFullList({
		filter: `
			text != null &&
			processed = true &&
			excluded != true
		`,
	})

	for (const medium of media) {
		if (!medium.text) continue

		// Refine the text and remove clutter.
		// TODO: only if it does not exist yet
		// const document = await refineText(medium.text)
		const document = medium.text

		ids.push(medium.id)
		documents.push(document)
		metadatas.push({ type: 'medium' })
	}

	// insert posts
	const posts = await pb
		.collection<Db.Post<true>>('posts')
		.getFullList({ filter: `caption != null` })

	for (const post of posts) {
		if (!post.caption) continue

		const document = post.caption

		ids.push(post.id)
		documents.push(document)
		metadatas.push({ type: 'post' })
	}

	// Filter out already existing items.
	const existingItems = await mediaCollection.get({ ids })
	existingItems.ids.forEach((id) => {
		if (!id) return
		const index = ids.indexOf(id)
		if (index < 0) return

		ids.splice(index, 1)
		documents.splice(index, 1)
		metadatas.splice(index, 1)
	})

	// Insert the new items.
	if (ids.length) {
		/**
		 * Has to be done in batches because otherwise
		 * Chroma throws (merely saying "Killed").
		 */
		const BATCH_SIZE = 30

		console.log(`📥 Inserting ${ids.length} item(s) in batches of ${BATCH_SIZE}...`)

		if (!production && !(await readLine('Continue? (y/n)'))) {
			process.exit(0)
		}

		const timing = new Timing(ids.length)

		for (let i = 0; i < ids.length; i += BATCH_SIZE) {
			await mediaCollection.upsert({
				ids: ids.slice(i, i + BATCH_SIZE),
				documents: documents.slice(i, i + BATCH_SIZE),
				metadatas: metadatas.slice(i, i + BATCH_SIZE),
			})

			timing.update(i)
		}

		timing.finish()
	} else {
		console.log('💡 No new items to insert.')
	}
}

if (import.meta.main) {
	await createEmbeddings()
}
