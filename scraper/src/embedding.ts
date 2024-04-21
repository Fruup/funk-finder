import {
	ChromaClient,
	Collection,
	IncludeEnum,
	OpenAIEmbeddingFunction,
	TransformersEmbeddingFunction,
	type IEmbeddingFunction,
} from 'chromadb'
import Pocketbase from 'pocketbase'
import type * as Db from '@funk-finder/db/types/models'
import OpenAI from 'openai'
import { refineText } from './refineText'

const config = {
	chromaPath: 'http://localhost:8000',
	// chromaPath: 'http://host.docker.internal:8000',
	pocketbasePath: 'http://localhost:8080',
	// pocketbasePath: 'http://host.docker.internal:8080',
	collectionName: 'media',
	openAiKey: import.meta.env.OPENAI_API_KEY,
	embeddingFunction: 'openai' satisfies 'local' | 'openai',
	// embeddingFunction: 'local' satisfies 'local' | 'openai',
	embeddingModel: import.meta.env.EMBEDDING_MODEL,
}

let openai: OpenAI
let chroma: ChromaClient
let mediaCollection: Collection
let embedder: IEmbeddingFunction

async function init() {
	if (!openai) {
		if (!config.openAiKey) {
			throw Error('OpenAI API key is required.')
		}

		openai = new OpenAI({
			apiKey: config.openAiKey,
		})
	}

	// Add media to chroma db.
	chroma = new ChromaClient({
		path: config.chromaPath,
	})

	// embedder
	if (config.embeddingFunction === 'local') {
		embedder = new TransformersEmbeddingFunction({
			// model,
		})
	} else if (config.embeddingFunction === 'openai') {
		if (!config.openAiKey) {
			throw Error('OpenAI API key is required.')
		}

		embedder = new OpenAIEmbeddingFunction({
			openai_api_key: config.openAiKey,
			openai_model: config.embeddingModel,
		})
	} else {
		throw Error(`Invalid embedding function "${config.embeddingFunction}".`)
	}

	mediaCollection = await chroma.getOrCreateCollection({
		name: config.collectionName,
		embeddingFunction: embedder,
		metadata: { 'hnsw:space': 'cosine' },
	})

	console.log(`💡 Database contains ${await mediaCollection.count()} item(s).`)

	const pb = new Pocketbase(config.pocketbasePath)

	const ids: string[] = []
	const documents: string[] = []
	const metadatas: { type: 'medium' | 'post' }[] = []

	// insert media
	// TODO
	const { items: media } = await pb.collection<Db.Medium<true>>('media').getList(1, 100)

	for (const medium of media) {
		if (!medium.text) continue

		// Refine the text and remove clutter.
		const document = await refineText(medium.text)

		ids.push(medium.id)
		documents.push(document)
		metadatas.push({ type: 'medium' })
	}

	// insert posts
	// TODO
	const { items: posts } = await pb.collection<Db.Post<true>>('posts').getList(1, 100)

	for (const post of posts) {
		if (!post.caption) continue

		const document = post.caption

		ids.push(post.id)
		documents.push(document)
		metadatas.push({ type: 'post' })
	}

	if (ids.length) {
		console.log(`📥 Inserting ${ids.length} item(s)...`)

		/**
		 * Has to be done in batches because otherwise
		 * Chroma throws (merely saying "Killed").
		 */
		const BATCH_SIZE = 10

		for (let i = 0; i < ids.length; i += BATCH_SIZE) {
			console.log(`💡 ${i.toString().padStart(ids.length.toString().length, ' ')}/${ids.length}`)

			await mediaCollection.upsert({
				ids: ids.slice(i, i + BATCH_SIZE),
				documents: documents.slice(i, i + BATCH_SIZE),
				metadatas: metadatas.slice(i, i + BATCH_SIZE),
			})
		}
	}
}

if (import.meta.main) {
	await init()
}
