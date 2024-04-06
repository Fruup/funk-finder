import type { RecordModel } from 'pocketbase'

export interface Medium extends RecordModel {
	id: string
	url: string
	alt?: string
	text?: string
}

export interface Post<Expand extends boolean = false> extends RecordModel {
	caption?: string
	media: (Expand extends true ? Medium : string)[]
	status: 'pending' | 'finished'
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
