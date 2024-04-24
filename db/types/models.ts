import type { RecordModel } from 'pocketbase'

export type Medium<
	/**
	 * Whether to include the record fields (id, created, updated etc.).
	 */
	IsModel extends boolean = false,
	/**
	 * Which fields to expand (id -> model)
	 */
	Expand extends keyof Medium | null = null,
> = {
	url: string
	alt?: string
	text?: string
	post?: string
	// post?: Expand extends 'post' ? Post : string
	igId?: string
	processed?: boolean
} & (IsModel extends true ? Model : {}) & {
		expand: {
			post: Expand extends 'post' ? Post : never
		}
	}

export type Post<
	/**
	 * Whether to include the record fields (id, created, updated etc.).
	 */
	IsModel extends boolean = false,
	/**
	 * Which fields to expand (id -> model)
	 */
	// Expand extends keyof Medium | null = null,
> = {
	shortcode: string
	caption?: string
	igId?: string
	time?: string // ISO datetime
} & (IsModel extends true ? Model : {})

type Model = {
	[K in keyof RecordModel]: string extends K ? never : RecordModel[K]
}
