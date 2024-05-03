import type { Db } from '@funk-finder/db'
import Pocketbase from 'pocketbase'

export interface UpdateMediaURLsResultItem {
	mediumId: string
	url: string
	updated: boolean
}

/**
 * Checks if the media URLs have expired and updates the DB entries accordingly.
 */
export async function updateMediaURLs(
	mediaIds: string[],
	{ pb }: { pb: Pocketbase },
): Promise<Promise<UpdateMediaURLsResultItem>[]> {
	// Group media by post.
	const queue: Record<
		string,
		{
			post: Db.Post
			media: {
				resolve: (value: UpdateMediaURLsResultItem) => any
				record: Db.Medium<true, 'post'>
			}[]
		}
	> = {}

	const promises: Promise<UpdateMediaURLsResultItem>[] = []

	for (const id of mediaIds) {
		const { promise, resolve } = Promise.withResolvers<UpdateMediaURLsResultItem>()

		const medium = await pb
			.collection<Db.Medium<true, 'post'>>('media')
			.getOne(id, { expand: 'post' })

		if (await isUrlOk(medium.url)) {
			// URL is still valid. Safe to resolve immediately.
			resolve({
				mediumId: id,
				url: medium.url,
				updated: false,
			})
		} else {
			// Add post to queue.
			const post = medium.expand.post

			if (!queue[post.shortcode]) {
				queue[post.shortcode] = {
					post,
					media: [],
				}
			}

			queue[post.shortcode].media.push({
				record: medium,
				resolve,
			})
		}

		promises.push(promise)
	}

	// No need to wait for this to finish. The promises will resolve in the background.
	Object.values(queue).map(async ({ media, post }) => {
		const updated = await getUpdatedPost(post.shortcode)
		if (!updated) {
			media.forEach((medium) =>
				medium.resolve({
					mediumId: medium.record.id,
					url: medium.record.url,
					updated: false,
				}),
			)

			return
		}

		return updated.media.map(async (updated) => {
			const medium = media.find((m) => m.record.igId === updated.igId)
			if (!medium) return

			const mediumId = medium.record.id
			const url = updated.url

			await pb.collection<Db.Medium>('media').update(mediumId, {
				url,
			})

			medium.resolve({
				mediumId,
				url,
				updated: true,
			})
		})
	})

	return promises
}

async function isUrlOk(url: string) {
	try {
		const response = await fetch(url)
		return response.ok
	} catch (e) {
		console.error(e)
		return false
	}
}

async function getUpdatedPost(shortcode: string) {
	try {
		const host = `http://scraper-api.funk-finder.orb.local`
		// http://scaper-api:3000
		const response = await fetch(`${host}/posts/${shortcode}`)

		type R = {
			type: 'GraphImage' | 'GraphSidecar'
			igId: string
			media: {
				igId: string
				url: string
			}[]
		}

		const text = await response.text()

		try {
			return JSON.parse(text) as R
		} catch (e) {
			console.error('Failed to parse JSON:', text)
		}
	} catch (e) {
		console.error(e)
	}
}
