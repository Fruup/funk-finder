export namespace Api {
	export const MEDIA_TYPES = ['IMAGE', 'CAROUSEL_ALBUM'] as const
	export type MediaType = (typeof MEDIA_TYPES)[number]

	export const isMediaType = (mediaType: any): mediaType is MediaType =>
		MEDIA_TYPES.includes(mediaType)

	export interface Medium {
		id: string
		media_url: string
		media_type: MediaType & string
		caption: string
	}
}

export namespace App {
	// interface Medium {
	// 	id: string
	// 	text: string
	// }

	// interface Post {
	// 	id: string
	// 	caption: string
	// 	media: Medium[] // JSON field
	// 	status: "pending" | "ready"
	// }

	export interface Post {
		id: string
		caption?: string
		media: {
			id: string
			url: string
		}[]
	}
}
