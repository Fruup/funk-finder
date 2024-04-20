import {
	ChromaClient,
	Collection,
	IncludeEnum,
	OpenAIEmbeddingFunction,
	TransformersEmbeddingFunction,
} from 'chromadb'
import Pocketbase, { type RecordModel } from 'pocketbase'
import { env } from '$env/dynamic/private'
import * as Db from '@funk-finder/db/types/models'
import type { SearchResponse, SearchResponseItemType } from '$lib/types'

let chroma: ChromaClient
let pb: Pocketbase
let collection: Collection

async function init() {
	if (!chroma) {
		chroma = new ChromaClient({
			path: env.CHROMADB_PATH,
		})
	}

	if (!collection) {
		// const embeddingFunction = new TransformersEmbeddingFunction({})

		if (!env.OPENAI_API_KEY) {
			throw new Error('OPENAI_API_KEY is required')
		}

		const embeddingFunction = new OpenAIEmbeddingFunction({
			openai_model: 'text-embedding-3-small',
			openai_api_key: env.OPENAI_API_KEY,
		})

		collection = await chroma.getCollection({
			name: env.CHROMADB_COLLECTION,
			embeddingFunction,
		})
	}

	if (!pb) {
		pb = new Pocketbase(env.POCKETBASE_PATH)
	}
}

export async function search(text: string): Promise<SearchResponse> {
	await init()

	const result = await collection.query({
		nResults: 20,
		queryTexts: [text],
		include: [IncludeEnum.Distances, IncludeEnum.Metadatas],
	})

	interface Metadata {
		type: SearchResponseItemType
	}

	const response: SearchResponse = []

	const promises = result.ids[0].map(async (id, i) => {
		const distance = result.distances![0][i]
		const metadata = result.metadatas![0][i] as unknown as Metadata

		const score = Math.exp(-distance)

		if (metadata.type === 'medium') {
			const medium = await pb.collection<Db.Medium & RecordModel>('media').getOne(id)
			if (!medium.text) return

			response.push({
				type: 'medium',
				id: medium.id,
				text: medium.text,
				imageUrl: medium.url,
				score,
			})
		} else if (metadata.type === 'post') {
			const post = await pb.collection<Db.Post & RecordModel>('posts').getOne(id)
			if (!post.caption) return

			response.push({
				type: 'post',
				id: post.id,
				text: post.caption,
				shortcode: post.shortcode,
				score,
			})
		}
	})

	await Promise.allSettled(promises)

	return response
}
