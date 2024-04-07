export interface Medium<Expand extends boolean = true> {
	url: string
	alt?: string
	text?: string
	post: Expand extends true ? Post : string
}

export interface Post {
	shortcode: string
	caption?: string
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
