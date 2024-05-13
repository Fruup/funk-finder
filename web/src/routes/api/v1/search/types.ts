import type { MediaUrlUpdate } from '$lib/server/updateMediaURLs'
import type { SearchResponse } from '$lib/types'

export interface SearchEvents {
	result: SearchResponse
	update: MediaUrlUpdate
}
