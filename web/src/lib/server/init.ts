import {
	ChromaClient,
	Collection,
	OpenAIEmbeddingFunction,
	TransformersEmbeddingFunction,
	type IEmbeddingFunction,
} from 'chromadb'
import Pocketbase from 'pocketbase'
import { env } from '$env/dynamic/private'

const config = {
	embedder: 'openai' satisfies 'openai' | 'local',
	embeddingModel: env.EMBEDDING_MODEL,
}

let chroma: ChromaClient
let pb: Pocketbase
let collection: Collection

export async function init(): Promise<{
	chroma: ChromaClient
	collection: Collection
	pb: Pocketbase
}> {
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
		pb.autoCancellation(false)
	}

	return { chroma, collection, pb }
}
