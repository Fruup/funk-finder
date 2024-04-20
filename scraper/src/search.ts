import {
	ChromaClient,
	Collection,
	IncludeEnum,
	OpenAIEmbeddingFunction,
	TransformersEmbeddingFunction,
	type IEmbeddingFunction,
} from 'chromadb'
import Pocketbase, { type RecordModel } from 'pocketbase'
import type * as Db from '@funk-finder/db/types/models'

const config = {
	// chromaPath: 'http://localhost:8000',
	chromaPath: 'http://host.docker.internal:8000',
	// pocketbasePath: 'http://localhost:8080',
	pocketbasePath: 'http://host.docker.internal:8080',
	// collectionName: 'media',
	collectionName: 'media-openai',
	embeddingFunction: 'openai' satisfies 'local' | 'openai',
	// embeddingFunction: 'local' satisfies 'local' | 'openai',
	openAiKey: import.meta.env.OPENAI_API_KEY,
}

let chroma: ChromaClient
let mediaCollection: Collection
let embedder: IEmbeddingFunction

async function init() {
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
			openai_model: 'text-embedding-3-small',
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

	// insert media
	const pb = new Pocketbase(config.pocketbasePath)

	const ids: string[] = []
	const documents: string[] = []
	const metadatas: { type: 'medium' | 'post' }[] = []

	const media = await pb.collection<Db.Medium & RecordModel>('media').getFullList()
	for (const medium of media) {
		if (!medium.text) continue

		ids.push(medium.id)
		documents.push(medium.text)
		metadatas.push({ type: 'medium' })
	}

	// insert posts
	const posts = await pb.collection<Db.Post & RecordModel>('posts').getFullList()
	for (const post of posts) {
		if (!post.caption) continue

		ids.push(post.id)
		documents.push(post.caption)
		metadatas.push({ type: 'post' })
	}

	if (ids.length) {
		console.log(`📥 Inserting ${ids.length} item(s) to the database.`)

		/**
		 * Has to be done in batches because otherwise
		 * Chroma throws (merely saying "Killed").
		 */
		const BATCH_SIZE = 10

		for (let i = 0; i < ids.length; i += BATCH_SIZE) {
			await mediaCollection.add({
				ids: ids.slice(i, i + BATCH_SIZE),
				documents: documents.slice(i, i + BATCH_SIZE),
				metadatas: metadatas.slice(i, i + BATCH_SIZE),
			})
		}
	}
}

async function search(text: string) {
	const result = await mediaCollection.query({
		nResults: 10,
		queryTexts: text,
		include: [
			// IncludeEnum.Metadatas,
			// IncludeEnum.Documents,
		],
	})

	return result
}

async function main() {
	await init()

	// const text = process.argv[2]
	// if (!text) {
	// 	throw Error('Please provide a text to search.')
	// }

	// const result = await search(text)

	// console.log(result)

	// await Bun.write('logs/result.json', JSON.stringify(result, null, 2), { createPath: true })
}

if (import.meta.main) {
	await main()
}
