export interface Medium<Expand extends keyof Medium | null = null> {
	url: string
	alt?: string
	text?: string
	post?: Expand extends 'post' ? Post : string
	igId?: string
}

export interface Post {
	shortcode: string
	caption?: string
	igId?: string
	time?: string // ISO datetime
}

// type MultipleReference<
// 	Model extends RecordModel,
// 	Expand extends boolean = false,
// > = Expand extends true ? Model[] : string[]

// export interface Post<Expand extends boolean> extends RecordModel {
// 	caption?: string
// 	media: MultipleReference<Medium, Expand>
// 	status: 'pending' | 'finished'
// }
