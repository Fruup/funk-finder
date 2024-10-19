import {
	ChromaClient,
	Collection,
	OpenAIEmbeddingFunction,
	TransformersEmbeddingFunction,
	type IEmbeddingFunction,
} from 'chromadb'
import Pocketbase from 'pocketbase'
import { env } from '$env/dynamic/private'
import { safeMs } from '$lib/utils'

const config = {
	embedder: 'openai' satisfies 'openai' | 'local',
	embeddingModel: env.EMBEDDING_MODEL,
}

let chroma: ChromaClient
let pb: Pocketbase
let collection: Collection

let pbAuthRefreshInterval: ReturnType<typeof setInterval>

export async function getChroma(): Promise<{
	chroma: ChromaClient
	collection: Collection
}> {
	if (!chroma) {
		if (!env.CHROMADB_PATH) throw Error('Missing environment variable CHROMADB_PATH.')
		if (!env.CHROMA_AUTH) throw Error('Missing environment variable CHROMA_AUTH.')

		chroma = new ChromaClient({
			path: env.CHROMADB_PATH,
			auth: {
				provider: 'basic',
				credentials: env.CHROMA_AUTH,
			},
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

	return { chroma, collection }
}

export async function getPocketbase() {
	if (!pb) {
		pb = new Pocketbase(env.POCKETBASE_PATH)
		pb.autoCancellation(false)

		// Authenticate.
		if (!env.POCKETBASE_AUTH) {
			throw new Error('POCKETBASE_AUTH is required')
		}

		const [username, ...rest] = env.POCKETBASE_AUTH.split(':')
		await pb.collection('users').authWithPassword(username, rest.join(':'))

		// Set up auto refresh. The lack of this broke the app multiple times now 🙃
		const interval = safeMs(env.POCKETBASE_AUTH_REFRESH_INTERVAL, '1d')

		clearInterval(pbAuthRefreshInterval)
		pbAuthRefreshInterval = setInterval(() => {
			pb.collection('users').authRefresh()
		}, interval)
	}

	return pb
}
