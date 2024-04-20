import type { SearchResponse } from '$lib/types'

export default {
	async search(text: string) {
		const query = new URLSearchParams({ q: text })
		const response = await fetch(`/api/v1/search?${query}`)

		if (response.ok) {
			const result: SearchResponse = await response.json()
			return result.toSorted((a, b) => b.score - a.score)
		}

		throw new Error(response.statusText)
	},
}
