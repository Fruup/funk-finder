import { ChromaClient, Collection, OpenAIEmbeddingFunction } from 'chromadb'
import Pocketbase from 'pocketbase'

let pb: Pocketbase
let chroma: ChromaClient
let embeddingFunction: OpenAIEmbeddingFunction
let mediaCollection: Collection

export async function getPocketbase() {
	if (pb) return pb

	if (!import.meta.env.POCKETBASE_PATH) {
		throw new Error('Missing environment variable POCKETBASE_PATH.')
	}

	pb = new Pocketbase(import.meta.env.POCKETBASE_PATH)
	pb.autoCancellation(false)

	// Authenticate.
	if (!import.meta.env.POCKETBASE_AUTH) throw Error('Missing environment variable POCKETBASE_AUTH.')
	const [username, ...rest] = import.meta.env.POCKETBASE_AUTH.split(':')
	await pb.collection('users').authWithPassword(username, rest.join(''))

	return pb
}

export async function getChroma() {
	if (chroma && embeddingFunction && mediaCollection) {
		return {
			chroma,
			embeddingFunction,
			mediaCollection,
		}
	}

	if (!import.meta.env.CHROMA_PATH) throw new Error('Missing environment variable CHROMA_PATH.')
	if (!import.meta.env.CHROMA_AUTH) throw new Error('Missing environment variable CHROMA_AUTH.')
	if (!import.meta.env.OPENAI_API_KEY)
		throw new Error('Missing environment variable OPENAI_API_KEY.')
	if (!import.meta.env.EMBEDDING_MODEL)
		throw new Error('Missing environment variable EMBEDDING_MODEL.')

	console.log(`Accessing ChromaDB under ${import.meta.env.CHROMA_PATH}.`)

	chroma = new ChromaClient({
		path: import.meta.env.CHROMA_PATH,
		auth: {
			provider: 'basic',
			credentials: import.meta.env.CHROMA_AUTH,
		},
	})

	embeddingFunction = new OpenAIEmbeddingFunction({
		openai_api_key: import.meta.env.OPENAI_API_KEY,
		openai_model: import.meta.env.EMBEDDING_MODEL,
	})

	mediaCollection = await chroma.getCollection({
		name: 'media',
		embeddingFunction,
	})

	return {
		chroma,
		embeddingFunction,
		mediaCollection,
	}
}
