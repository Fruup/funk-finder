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
import { Timing } from './helpers/timing'
import { readLine } from './helpers/readLine'

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

	console.log(
		`💡 Database collection "${
			config.collectionName
		}" contains ${await mediaCollection.count()} item(s).`,
	)

	const pb = new Pocketbase(config.pocketbasePath)

	const ids: string[] = []
	const documents: string[] = []
	const metadatas: { type: 'medium' | 'post' }[] = []

	// insert media
	const media = await pb
		.collection<Db.Medium<true>>('media')
		.getFullList({ filter: `text != null && processed = true` })

	for (const medium of media) {
		if (!medium.text) continue

		// Refine the text and remove clutter.
		const document = await refineText(medium.text)

		ids.push(medium.id)
		documents.push(document)
		metadatas.push({ type: 'medium' })
	}

	// insert posts
	const posts = await pb
		.collection<Db.Post<true>>('posts')
		.getFullList({ filter: `caption != null` })

	for (const post of posts) {
		if (!post.caption) continue

		const document = post.caption

		ids.push(post.id)
		documents.push(document)
		metadatas.push({ type: 'post' })
	}

	// Filter out already existing items.
	const existingItems = await mediaCollection.get({ ids })
	existingItems.ids.forEach((id) => {
		if (!id) return
		const index = ids.indexOf(id)
		if (index < 0) return

		ids.splice(index, 1)
		documents.splice(index, 1)
		metadatas.splice(index, 1)
	})

	// Insert the new items.
	if (ids.length) {
		console.log(`📥 Inserting ${ids.length} item(s)...`)

		if (!(await readLine('Continue? (y/n)'))) {
			process.exit(0)
		}

		const timing = new Timing(ids.length)

		/**
		 * Has to be done in batches because otherwise
		 * Chroma throws (merely saying "Killed").
		 */
		const BATCH_SIZE = 30

		for (let i = 0; i < ids.length; i += BATCH_SIZE) {
			await mediaCollection.upsert({
				ids: ids.slice(i, i + BATCH_SIZE),
				documents: documents.slice(i, i + BATCH_SIZE),
				metadatas: metadatas.slice(i, i + BATCH_SIZE),
			})

			timing.update(i)
		}

		timing.finish()
	}
}

if (import.meta.main) {
	await init()
}
