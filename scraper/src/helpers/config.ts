import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb'
import Pocketbase from 'pocketbase'

export function getPocketbase() {
	if (!import.meta.env.POCKETBASE_PATH) {
		throw new Error('Missing environment variable POCKETBASE_PATH.')
	}

	const pb = new Pocketbase(import.meta.env.POCKETBASE_PATH)
	pb.autoCancellation(false)

	return pb
}

export async function getChroma() {
	if (!import.meta.env.CHROMA_PATH) throw new Error('Missing environment variable CHROMA_PATH.')
	if (!import.meta.env.OPENAI_API_KEY)
		throw new Error('Missing environment variable OPENAI_API_KEY.')
	if (!import.meta.env.EMBEDDING_MODEL)
		throw new Error('Missing environment variable EMBEDDING_MODEL.')

	console.log(`Accessing ChromaDB unter ${import.meta.env.CHROMA_PATH}.`)

	const chroma = new ChromaClient({
		path: import.meta.env.CHROMA_PATH,
	})

	const embeddingFunction = new OpenAIEmbeddingFunction({
		openai_api_key: import.meta.env.OPENAI_API_KEY,
		openai_model: import.meta.env.EMBEDDING_MODEL,
	})

	const mediaCollection = await chroma.getCollection({
		name: 'media',
		embeddingFunction,
	})

	return {
		chroma,
		embeddingFunction,
		mediaCollection,
	}
}
