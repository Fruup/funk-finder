import { createWorker } from 'tesseract.js'
import Pocketbase from 'pocketbase'
import logger from './src/logger'
import type * as Db from '@funk-finder/db/types/models'

const pb = new Pocketbase('http://localhost:8080')

// Fetch pending posts.
const posts = await pb.collection<Db.Post>('posts').getFullList({
	filter: `status = 'pending'`,
})

const langs = 'deu+eng'

// Start workers.
const promises = posts.map(async (post) => {
	if (!post.media) return

	const updatedMedia = await Promise.all(
		post.media.map(async (medium) => {
			try {
				const worker = await createWorker(langs)
				const result = await worker.recognize(medium.url)
				await worker.terminate()

				await logger.write(`ocr/${post.id}_${medium.id}`, {
					text: result.data.text,
					hocr: result.data.hocr,
					confidence: result.data.confidence,
				})

				if (result.data.confidence < 50) {
					throw Error(`Confidence was too low.`)
				}

				return {
					...medium,
					text: result.data.text,
				}
			} catch (e) {
				console.error(e)
				console.warn('Falling back to original medium.')

				return medium
			}
		}),
	)

	await pb.collection(post.collectionId).update(post.id, {
		media: updatedMedia,
		status: 'finished',
	})

	return post
})

const results = await Promise.allSettled(promises)

// Log summary.
for (let i = 0; i < results.length; ++i) {
	const result = results[i]
	const post = posts[i]

	if (result.status === 'fulfilled') {
		console.info(`ℹ️ Successfully processed post with ID '${post.id}'.`)
	} else {
		console.warn(`⚠️ Failed to process post with ID '${post.id}'. Reason:`)
		console.error(result.reason)
	}
}
