const MEDIUM_TYPES = ['GraphSidecar', 'GraphImage'] as const
type MediumType = (typeof MEDIUM_TYPES)[number]
export const isValidMediumType = (s: any): s is MediumType => MEDIUM_TYPES.includes(s)

interface NodeBase {
	__typename: string
	id: string
	shortcode?: string
	dimensions: { height: number; width: number }
	accessibility_caption: string | null
	display_url: string
}

export interface NodeImage extends NodeBase {
	__typename: 'GraphImage'
}

export interface NodeSidecar extends NodeBase {
	__typename: 'GraphSidecar'
	edge_sidecar_to_children: {
		edges: {
			node: Node
		}[]
	}
}

interface NodeOther extends NodeBase {
	__typename: '_other'
}

type Node = NodeSidecar | NodeImage | NodeOther

export const isImageNode = (node: Node): node is NodeImage => node.__typename === 'GraphImage'
export const isSidecarNode = (node: Node): node is NodeSidecar => node.__typename === 'GraphSidecar'

export interface Metadata {
	node: Node
}

export interface Post {
	caption: string
	shortcode: string
	time: number | null
	igId?: string
	media: {
		// id: string
		url: string
		alt: string | null
		igId?: string
	}[]
}
