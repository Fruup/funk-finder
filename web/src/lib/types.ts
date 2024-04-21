export interface SearchResponseItem {
	id: string
	type: 'post' | 'medium'
	text: string
	score: number
	shortcode: string
	imageUrl: string
}

export type SearchResponseItemType = SearchResponseItem['type']
export type SearchResponse = SearchResponseItem[]
