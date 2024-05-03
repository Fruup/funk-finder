import type { SearchResponseItem } from '$lib/types'
import { writable } from 'svelte/store'
import type { API } from '.'

const mockData: SearchResponseItem[] = Array.from({ length: 10 }, (_, i) => ({
	id: i.toString(),
	type: 'medium',
	text: `Post ${i}`,
	imageUrl: `https://picsum.photos/seed/${i}/300/300.webp`,
	shortcode: 'shortcode',
	score: 0,
}))

export const mockApi: API = {
	async search(text) {
		const arr = [...mockData]
		const N = 5

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
			store.update((items) => {
				items.forEach((item) => {
					item.imageUrl = item.imageUrl.replace('<nope>', '')
				})

				return items
			})
		}, 2000)

		return store
	},
}
