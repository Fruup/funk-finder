import type { SearchResponse, SearchResponseItem } from '$lib/types'
import { writable, type Writable } from 'svelte/store'
import type { API } from '.'

const mockData: SearchResponseItem[] = Array.from({ length: 12 }, (_, i) => ({
	id: i.toString(),
	type: 'medium',
	text: `Post ${i}`,
	imageUrl: `https://picsum.photos/seed/${i}/300/300.webp`,
	shortcode: 'shortcode',
	score: 0,
}))

export const mockApi: API = {
	async search(text) {
		const { promise, resolve } = Promise.withResolvers<Writable<SearchResponse>>()

		const arr = [...mockData]
		const N = 12

		while (arr.length > N) {
			arr.splice(Math.floor(Math.random() * arr.length), 1)
		}

		arr.forEach((item) => {
			item.score = Math.random()
		})

		arr.slice(0, 3).forEach((item) => {
			item.imageUrl = '<nope>' + item.imageUrl
		})

		const store = writable<SearchResponseItem[]>(arr)

		setTimeout(() => {
			resolve(store)

			setTimeout(() => {
				store.update((items) => {
					items.forEach((item) => {
						item.imageUrl = item.imageUrl.replace('<nope>', '')
					})

					return items
				})
			}, 2000)
		}, 2000)

		return promise
	},
}
