import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb'
import Pocketbase from 'pocketbase'

export function getPocketbase() {
	if (!import.meta.env.POCKETBASE_PATH) {
		throw new Error('Missing environment variable POCKETBASE_PATH.')
	}

	return new Pocketbase(import.meta.env.POCKETBASE_PATH)
}

export function getChroma() {
	if (!import.meta.env.CHROMA_PATH) throw new Error('Missing environment variable CHROMA_PATH.')
	if (!import.meta.env.OPENAI_API_KEY)
		throw new Error('Missing environment variable OPENAI_API_KEY.')
	if (!import.meta.env.EMBEDDING_MODEL)
		throw new Error('Missing environment variable EMBEDDING_MODEL.')

	const chroma = new ChromaClient({
		path: import.meta.env.CHROMA_PATH,
	})

	const embeddingFunction = new OpenAIEmbeddingFunction({
		openai_api_key: import.meta.env.OPENAI_API_KEY,
		openai_model: import.meta.env.EMBEDDING_MODEL,
	})

	return {
		chroma,
		embeddingFunction,
		mediaCollection: chroma.getCollection({
			name: 'media',
			embeddingFunction,
		}),
	}
}
