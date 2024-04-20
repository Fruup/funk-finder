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
	embeddingFunction: 'local' satisfies 'local' | 'openai',
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
		embedder = new TransformersEmbeddingFunction()
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
		name: 'media',
		embeddingFunction: embedder,
		metadata: { 'hnsw:space': 'cosine' },
	})

	console.log(`💡 Database contains ${await mediaCollection.count()} item(s).`)

	// insert media
	const pb = new Pocketbase(config.pocketbasePath)

	const media = await pb.collection<Db.Medium & RecordModel>('media').getFullList()
	const filteredMedia = media.filter(
		(medium): medium is typeof medium & { text: string } => !!medium.text,
	)

	await mediaCollection.add({
		ids: filteredMedia.map(({ id }) => id),
		documents: filteredMedia.map(({ text }) => text),
	})

	// insert posts
	const posts = await pb.collection<Db.Post & RecordModel>('posts').getFullList()
	const filteredPosts = posts.filter(
		(post): post is typeof post & { caption: string } => !!post.caption,
	)

	await mediaCollection.add({
		ids: filteredPosts.flatMap(({ id }) => id),
		documents: filteredPosts.map(({ caption }) => caption),
	})
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

	const text = process.argv[2]
	if (!text) {
		throw Error('Please provide a text to search.')
	}

	const result = await search(text)

	console.log(result)

	// await Bun.write('logs/result.json', JSON.stringify(result, null, 2), { createPath: true })
}

if (import.meta.main) {
	main()
}
