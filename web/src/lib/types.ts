interface SearchResponseItemBase {
	id: string
	type: string
	text: string
	score: number
}

interface SearchResponseItemPost extends SearchResponseItemBase {
	type: 'post'
	shortcode: string
}

interface SearchResponseItemMedium extends SearchResponseItemBase {
	type: 'medium'
	imageUrl: string
}

export type SearchResponseItem = SearchResponseItemPost | SearchResponseItemMedium
export type SearchResponseItemType = SearchResponseItem['type']
export type SearchResponse = SearchResponseItem[]
