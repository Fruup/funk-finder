import {
	ChromaClient,
	Collection,
	IncludeEnum,
	OpenAIEmbeddingFunction,
	TransformersEmbeddingFunction,
	type IEmbeddingFunction,
} from 'chromadb'
import Pocketbase from 'pocketbase'
import { env } from '$env/dynamic/private'
import * as Db from '@funk-finder/db/types/models'
import type { SearchResponse, SearchResponseItem, SearchResponseItemType } from '$lib/types'
import { updateMediaURLs } from './updateMediaURLs'

const config = {
	embedder: 'openai' satisfies 'openai' | 'local',
	embeddingModel: env.EMBEDDING_MODEL,
}

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
		let embeddingFunction: IEmbeddingFunction

		if (config.embedder === 'local') {
			embeddingFunction = new TransformersEmbeddingFunction({})
		} else if (config.embedder === 'openai') {
			if (!env.OPENAI_API_KEY) {
				throw new Error('OPENAI_API_KEY is required')
			}

			embeddingFunction = new OpenAIEmbeddingFunction({
				openai_model: config.embeddingModel,
				openai_api_key: env.OPENAI_API_KEY,
			})
		} else {
			throw new Error('Invalid embedder: ' + config.embedder)
		}

		collection = await chroma.getCollection({
			name: env.CHROMADB_COLLECTION,
			embeddingFunction,
		})
	}

	if (!pb) {
		pb = new Pocketbase(env.POCKETBASE_PATH)
	}
}

export async function search(text: string): Promise<{
	result: SearchResponse
	updateMediaURLsPromises: Promise<{ mediumId: string; url: string } | undefined>[]
}> {
	await init()

	const result = await collection.query({
		nResults: 15,
		queryTexts: [text],
		include: [IncludeEnum.Distances, IncludeEnum.Metadatas],
	})

	const ids = result.ids?.[0]

	if (!ids?.length) {
		throw new Error('No results found')
	}

	const items = ids
		.map((id, index) => ({
			id,
			score: result.distances![0][index],
			metadata: result.metadatas![0][index] as unknown as Metadata,
		}))
		.toSorted((a, b) => a.score - b.score)

	// Refresh media URLs.
	const updateMediaURLsPromises = items.map(async ({ id }) => {
		const result = await updateMediaURLs([id])
		return result.at(0)
	})

	const results = await Promise.allSettled(
		items.map<Promise<SearchResponseItem | undefined>>(async ({ id, score, metadata }) => {
			if (metadata.type === 'medium') {
				const medium = await pb
					.collection<Db.Medium<true, 'post'>>('media')
					.getOne(id, { expand: 'post' })

				if (!medium.text) {
					console.warn('Text not found for medium', medium.id)
					return
				}

				return {
					type: 'medium',
					id: medium.id,
					text: medium.text,
					imageUrl: medium.url,
					shortcode: medium.expand.post.shortcode,
					score,
				}
			} else if (metadata.type === 'post') {
				const post = await pb.collection<Db.Post<true>>('posts').getOne(id)
				if (!post.caption) return

				const medium = await pb
					.collection<Db.Medium>('media')
					.getFirstListItem(`post = "${post.id}"`, { sort: 'created' })

				if (!medium) {
					console.warn('Medium not found for post', post.id)
					return
				}

				return {
					type: 'post',
					id: post.id,
					text: post.caption,
					shortcode: post.shortcode,
					imageUrl: medium.url,
					score,
				}
			}
		}),
	)

	return {
		result: results
			.map((promise) => {
				if (promise.status === 'rejected') {
					console.error(promise.reason)
					return
				}

				return promise.value
			})
			.filter((value): value is SearchResponseItem => !!value),
		updateMediaURLsPromises,
	}
}

interface Metadata {
	type: SearchResponseItemType
}
