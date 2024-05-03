import type { Db } from '@funk-finder/db'
import Pocketbase from 'pocketbase'
import { collect, loadPosts } from './collect'
import './helpers/shims'

/**
 * Checks if the media URLs have expired and updates the DB entries accordingly.
 */
export async function updateMediaURLs(
	mediaIds: string[],
	{ pb }: { pb: Pocketbase },
): Promise<{ mediumId: string; url: string }[]> {
	if (!mediaIds?.length) {
		throw new Error('No media IDs provided.')
	}

	const media = await pb
		.collection<Db.Medium<true, 'post'>>('media')
		.getFullList({
			filter: mediaIds.map((id) => `id="${id}"`).join('||'),
			expand: 'post',
			// fields: "id,url,post.igId"
		})
		.catch((e) => {
			console.error(e?.toJSON())
			return null
		})

	if (!media) {
		throw new Error('No media found')
	}

	const posts = await media.mapCollectAsync(async (medium) => {
		// Check if the URL is still valid.
		try {
			const ok = await fetch(medium.url).then(({ ok }) => ok)
			if (ok) return
		} catch (e) {
			console.error(e)
		}

		return medium.expand.post.shortcode
	})

	await loadPosts({ posts })

	const updatedPosts = await posts.mapCollectAsync((shortcode) => collect('-' + shortcode))

	const result: { mediumId: string; url: string }[] = []

	await updatedPosts
		.flatMap((posts) => posts)
		.flatMap(({ media }) => media)
		.forEachAsync(async ({ igId, url }) => {
			const mediumToUpdate = await pb
				.collection<Db.Medium<true>>('media')
				.getFirstListItem(`igId = "${igId}"`)
			if (!mediumToUpdate) return

			result.push({ mediumId: mediumToUpdate.id, url })

			await pb.collection<Db.Medium>('media').update(mediumToUpdate.id, {
				url,
			})
		})

	return result
}
