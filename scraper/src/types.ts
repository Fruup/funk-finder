const MEDIUM_TYPES = ['GraphSidecar', 'GraphImage'] as const
type MediumType = (typeof MEDIUM_TYPES)[number]
export const isValidMediumType = (s: any): s is MediumType => MEDIUM_TYPES.includes(s)

export interface Metadata {
	node: {
		__typename: MediumType
		id: string
		shortcode: string
		dimensions: { height: number; width: number }
		display_url: string
		accessibility_caption: string
		// edge_media_to_caption: {
		// 	edges: [{ node: { text: 'Ist doch viel passiert \ud83c\udf42' } }]
		// }
		edge_sidecar_to_children?: {
			edges: {
				node: {
					__typename: 'GraphImage'
					id: string
					shortcode: string
					dimensions: { height: number; width: number }
					display_url: string
					accessibility_caption: string
				}
			}[]
		}
	}
}

export interface Post {
	caption: string
	media: {
		id: string
		url: string
		alt: string
	}[]
}
