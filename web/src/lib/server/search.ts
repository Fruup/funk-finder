import { IncludeEnum } from 'chromadb'
import * as Db from '@funk-finder/db/types/models'
import type { SearchResponse, SearchResponseItem, SearchResponseItemType } from '$lib/types'
import { updateMediaURLs, type UpdateMediaURLsResultItem } from './updateMediaURLs'
import { init } from './init'

/**
 * Searches the embeddings database for the given text.
 * Returns the resulting items immediately (`result`).
 * Returns an array of promises that resolve when the media URLs have been updated (`urlUpdatePromises`).
 * This is necessary because the media URLs may have expired and need to be refreshed (damn you, instagram).
 * This enables the UI to show a result immediately and update the results with the new URLs one after the other.
 */
export async function search(text: string): Promise<{
	result: SearchResponse
	urlUpdatePromises: Promise<UpdateMediaURLsResultItem>[]
}> {
	const { collection, pb } = await init()

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
	// TODO: what about posts?
	const urlUpdatePromises = updateMediaURLs(
		items.filter(({ metadata }) => metadata.type === 'medium').map(({ id }) => id),
		{ pb },
	)

	const results = await Promise.allSettled(
		items.map<Promise<SearchResponseItem | undefined>>(async ({ id, score, metadata }) => {
			if (metadata.type === 'medium') {
				const medium = await pb
					.collection<Db.Medium<true, 'post'>>('media')
					.getOne(id, { expand: 'post' })

				if (!medium.text) {
					console.warn('Text not found for medium', medium.id)
					return
				}

				return {
					type: 'medium',
					id: medium.id,
					text: medium.text,
					imageUrl: medium.url,
					shortcode: medium.expand.post.shortcode,
					score,
				}
			} else if (metadata.type === 'post') {
				const post = await pb.collection<Db.Post<true>>('posts').getOne(id)
				if (!post.caption) return

				const medium = await pb
					.collection<Db.Medium<true>>('media')
					.getFirstListItem(`post = "${post.id}"`, { sort: 'created' })

				if (!medium) {
					console.warn('Medium not found for post', post.id)
					return
				}

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
				console.error(promise.reason)
				return
			}

			return promise.value
		})
		.filter((value): value is SearchResponseItem => !!value)

	return {
		result: responseItems,
		urlUpdatePromises: await urlUpdatePromises,
	}
}

interface Metadata {
	type: SearchResponseItemType
}
