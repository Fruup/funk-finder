import { IncludeEnum } from 'chromadb'
import * as Db from '@funk-finder/db/types/models'
import type { SearchResponse, SearchResponseItem, SearchResponseItemType } from '$lib/types'
import { MediaUrlUpdater, type MediaUrlUpdate } from './updateMediaURLs'
import { getChroma, getPocketbase } from './init'
import { ClientResponseError } from 'pocketbase'

/**
 * Searches the embeddings database for the given text.
 * Returns the resulting items immediately (`result`).
 * Returns an array of promises that resolve when the media URLs have been updated (`urlUpdatePromises`).
 * This is necessary because the media URLs may have expired and need to be refreshed (damn you, instagram).
 * This enables the UI to show a result immediately and update the results with the new URLs one after the other.
 */
export async function search(text: string): Promise<{
	result: SearchResponse
	urlUpdatePromises: Promise<MediaUrlUpdate | null>[]
}> {
	const pb = await getPocketbase()
	const { collection } = await getChroma()

	const result = await collection.query({
		nResults: 21,
		queryTexts: [text],
		include: [IncludeEnum.Distances, IncludeEnum.Metadatas],
	})

	const ids = result.ids?.[0]

	if (!ids?.length) {
		throw new Error('No results found')
	}

	const items = ids
		.map((id, index) => ({
			id,
			score: result.distances![0][index],
			metadata: result.metadatas![0][index] as unknown as Metadata,
		}))
		.toSorted((a, b) => a.score - b.score)

	// Refresh the media URLs that have expired.
	const updater = new MediaUrlUpdater(pb)

	const results = await Promise.allSettled(
		items.map<Promise<SearchResponseItem | undefined>>(async ({ id, score, metadata }) => {
			if (metadata.type === 'medium') {
				const medium = await pb
					.collection<Db.Medium<true, 'post'>>('media')
					.getOne(id, { expand: 'post' })
					.catch((e) => {
						console.error('Error fetching medium', id)
						throw e
					})

				if (!medium.text) {
					console.warn('Text not found for medium', medium.id)
					return
				}

				const shortcode = medium.expand.post.shortcode

				// Refresh the media URL if it has expired.
				updater.add({
					shortcode,
					igId: medium.igId,
					type: 'medium',
					id: medium.id,
					currentUrl: medium.url,
				})

				return {
					type: 'medium',
					id: medium.id,
					text: medium.text,
					imageUrl: medium.url,
					shortcode,
					score,
				}
			} else if (metadata.type === 'post') {
				const post = await pb
					.collection<Db.Post<true>>('posts')
					.getOne(id)
					.catch((e) => {
						console.error('Error fetching post', id)
						throw e
					})

				if (!post.caption) return

				const medium = await pb
					.collection<Db.Medium<true>>('media')
					.getFirstListItem(`post = "${post.id}"`, { sort: 'created' })
					.catch((e) => {
						// This can happen if a post has only video media attached.
						if (e instanceof ClientResponseError && e.status === 404) return

						console.error('Error fetching medium for post', post.id)
						throw e
					})

				if (!medium) {
					console.warn('Medium not found for post', post.id)
					return
				}

				// Refresh the media URL if it has expired.
				updater.add({
					type: 'post',
					id: post.id,
					igId: medium.igId,
					shortcode: post.shortcode,
					currentUrl: medium.url,
				})

				return {
					type: 'post',
					id: post.id,
					text: post.caption,
					shortcode: post.shortcode,
					imageUrl: medium.url,
					score,
				}
			}
		}),
	)

	const responseItems = results
		.map((promise) => {
			if (promise.status === 'rejected') {
				const e = promise.reason
				if (e instanceof ClientResponseError) {
					console.error(e.toJSON())
				} else {
					console.error(promise.reason)
				}

				return
			}

			return promise.value
		})
		.filter((value): value is SearchResponseItem => !!value)

	return {
		result: responseItems,
		urlUpdatePromises: await updater.dispatch(),
	}
}

interface Metadata {
	type: SearchResponseItemType
}
