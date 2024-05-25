import { env } from '$env/dynamic/private'
import Pocketbase from 'pocketbase'
import { type Db } from '@funk-finder/db'
import type { ScraperApiPostsResponse } from '@funk-finder/scraper/src/types'
import { isUrlOk } from '@funk-finder/scraper/src/updateMediaURLs'
import '@funk-finder/scraper/src/helpers/shims'

export class MediaUrlUpdater {
	constructor(private pb: Pocketbase) {}

	items: MediaUrlUpdaterItem[] = []

	add(item: MediaUrlUpdaterItem) {
		this.items.push(item)
	}

	async dispatch(): Promise<Promise<MediaUrlUpdate | null>[]> {
		// Filter items that need updating.
		const items = await this.items.mapCollectAsync(async (item) => {
			if (item.currentUrl && (await isUrlOk(item.currentUrl))) return null
			return item
		})

		// Deduplicate posts by their shortcode.
		const shortcodes = new Set(items.map(({ shortcode }) => shortcode))

		const updates: {
			[shortcode: string]: ReturnType<typeof getUpdatedPost>
		} = Object.fromEntries(
			Array.from(shortcodes).map((shortcode) => [shortcode, getUpdatedPost(shortcode)]),
		)

		return items.map<Promise<MediaUrlUpdate | null>>(async (item) => {
			const updated = await updates[item.shortcode].catch(console.error)
			if (!updated) return null

			const url = updated.media.find((m) => m.igId === item.igId)?.url
			if (!url) {
				console.warn('URL not found for', item)
				return null
			}

			// Asynchronously update the db entries.
			updated.media.forEach(({ igId, url }) => updateMediumUrl(igId, url, this.pb))

			return {
				id: item.id,
				type: item.type,
				url,
			}
		})
	}
}

export interface MediaUrlUpdaterItem {
	id: string
	type: 'post' | 'medium'
	shortcode: string
	igId: string
	currentUrl?: string
}

export interface MediaUrlUpdate {
	type: 'post' | 'medium'
	id: string
	url: string
}

async function getUpdatedPost(shortcode: string): Promise<ScraperApiPostsResponse | undefined> {
	try {
		const host = env.SCRAPER_PATH
		const response = await fetch(`${host}/posts/${shortcode}`)

		const text = await response.text()

		try {
			return JSON.parse(text)
		} catch (e) {
			console.error('Failed to parse JSON:', text)
		}
	} catch (e) {
		console.error(e)
	}
}

async function updateMediumUrl(igId: string, url: string, pb: Pocketbase) {
	try {
		const medium = await pb
			.collection<Db.Medium<true>>('media')
			.getFirstListItem(`igId = "${igId}"`)
		if (!medium) return

		await pb.collection<Db.Medium<true>>('media').update(medium.id, { url })
	} catch (e) {
		console.error('Error updating medium URL', { igId, url })
		console.error(e)
	}
}
