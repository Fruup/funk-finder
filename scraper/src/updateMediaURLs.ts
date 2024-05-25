import type { Db } from '@funk-finder/db'
import Pocketbase from 'pocketbase'
import type { ScraperApiPostsResponse } from './types'
import './helpers/shims'

/**
 * Checks if the media URL has expired and updates the DB entries accordingly.
 */
export async function updateMediumURL(
	mediaId: string,
	{ pb, scraperApiPath }: { pb: Pocketbase; scraperApiPath: string },
): Promise<string> {
	const medium = await pb
		.collection<Db.Medium<true, 'post'>>('media')
		.getOne(mediaId, { expand: 'post' })
		.catch((e) => {
			console.error(e?.toJSON())
			return null
		})

	if (!medium) {
		throw new Error('No media found')
	}

	// Call scraper API to get the new post.
	const response = await fetch(`${scraperApiPath}/posts/${medium.expand.post.shortcode}`)
	if (!response.ok) {
		console.error(response.status, response.statusText)
		throw new Error('Failed to fetch post')
	}

	const updatedPost = (await response.json()) as ScraperApiPostsResponse

	// Update DB entries of all media of the post.
	const promises = updatedPost.media.map(async ({ igId, url }) => {
		const mediumToUpdate = await pb
			.collection<Db.Medium<true>>('media')
			.getFirstListItem(`igId = "${igId}"`)
		if (!mediumToUpdate) return

		await pb.collection<Db.Medium>('media').update(mediumToUpdate.id, {
			url,
		})
	})

	await Promise.allSettled(promises)

	const found = updatedPost.media.find((m) => m.igId === medium.igId)
	if (!found) {
		throw new Error('Media not found in the updated post.')
	}

	return found.url
}

export async function isUrlOk(url: string) {
	try {
		const response = await fetch(url)
		return response.ok
	} catch (e) {
		console.error(e)
		return false
	}
}
