import type { Db } from '@funk-finder/db'
import Pocketbase from 'pocketbase'
import type { ScraperApiPostsResponse } from './types'
import './helpers/shims'

export async function updateMediumURLs(
	postShortcode: string,
	{
		pb,
		scraperApiPath,
		media,
	}: { pb: Pocketbase; scraperApiPath: string; media?: { igId: string; url: string }[] },
) {
	// Call scraper API to get the new post.
	const response = await fetch(`${scraperApiPath}/posts/${postShortcode}`)
	if (!response.ok) {
		console.error(response.status, response.statusText)
		throw new Error(`Failed to fetch post ${postShortcode}`)
	}

	const updatedPost = (await response.json()) as ScraperApiPostsResponse

	// Update DB entries of all media of the post.
	return await Promise.all(
		updatedPost.media.map(async ({ igId, url }) => {
			try {
				const mediumToUpdate = await pb
					.collection<Db.Medium<true>>('media')
					.getFirstListItem(`igId = "${igId}"`)
				if (!mediumToUpdate) return

				// Update the input media, if provided.
				const found = media?.find((m) => m.igId === igId)
				if (found) found.url = url

				return await pb.collection<Db.Medium<true>>('media').update(mediumToUpdate.id, {
					url,
				})
			} catch (e) {
				console.error(e)
			}
		}),
	)
}

/**
 * Checks if the media URL has expired and updates the DB entries accordingly.
 */
export async function updateMediumURL(
	mediumOrId: Db.Medium<true, 'post'> | string,
	{ pb, scraperApiPath }: { pb: Pocketbase; scraperApiPath: string },
): Promise<string> {
	const medium =
		typeof mediumOrId === 'string'
			? await pb
					.collection<Db.Medium<true, 'post'>>('media')
					.getOne(mediumOrId, { expand: 'post' })
					.catch((e) => {
						console.error(e?.toJSON())
						return null
					})
			: mediumOrId

	if (!medium) {
		throw new Error('Medium not found')
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

	;(await Promise.allSettled(promises)).forEach((result) => {
		if (result.status === 'rejected') {
			console.error(result.reason)
		}
	})

	const found = updatedPost.media.find((m) => m.igId === medium.igId)
	if (!found) {
		throw new Error('Media not found in the updated post.')
	}

	return found.url
}

export async function isUrlOk(url: string, options: { timeout?: number } = {}) {
	const { timeout = 3000 } = options
	let timeoutId: ReturnType<typeof setTimeout> | null = null

	try {
		const controller = new AbortController()
		timeoutId = setTimeout(() => controller.abort(), timeout)

		const response = await fetch(url, { signal: controller.signal })
		return response.ok
	} catch (e) {
		console.error(e)
		return false
	} finally {
		if (timeoutId != null) {
			clearTimeout(timeoutId)
		}
	}
}
