import type { SearchResponse } from '$lib/types'
import { mockApi } from './mock'

export interface API {
	search(text: string): Promise<SearchResponse>
}

const api = {
	async search(text: string) {
		const query = new URLSearchParams({ q: text })
		const response = await fetch(`/api/v1/search?${query}`)

		if (response.ok) {
			return (await response.json()) as SearchResponse
		}

		throw new Error(response.statusText)
	},
} satisfies API

export default api
// export default mockApi
