import { execSync } from 'node:child_process'
import { readdirSync, rmdirSync } from 'node:fs'
import { join } from 'node:path'
import { type Metadata, type Post } from './src/types'
import Pocketbase from 'pocketbase'
import type * as Db from '@funk-finder/db/types/models'

const production = process.env.NODE_ENV === 'production'
const TARGET = 'leonmaj7'

async function load() {
	const result = execSync(`
    instaloader \
      --no-pictures \
      --no-videos \
      --no-profile-pic \
      --no-compress-json \
      --latest-stamps ./state/timestamps.ini \
      --login leonmaj7 \
			--sessionfile ./state/session \
      ${TARGET}
  `)

	console.log(result.toString('utf8'))
}

async function collect() {
	const posts: Post[] = []
	const dir = readdirSync(TARGET, { recursive: false, withFileTypes: true })

	for (const entry of dir) {
		if (!entry.isFile()) continue
		if (!entry.name.endsWith('_UTC.json')) continue

		const caption = await Bun.file(join(TARGET, entry.name.slice(0, -5) + '.txt')).text()
		const metadata: Metadata = await Bun.file(join(TARGET, entry.name)).json()

		const post: Post = {
			caption: caption.trim(),
			media: [],
		}

		if (metadata.node.__typename === 'GraphImage') {
			post.media = [
				{
					id: metadata.node.shortcode,
					url: metadata.node.display_url,
					alt: metadata.node.accessibility_caption,
				},
			]
		} else if (metadata.node.__typename === 'GraphSidecar') {
			post.media = metadata.node.edge_sidecar_to_children!.edges.map((edge) => ({
				id: edge.node.shortcode,
				url: edge.node.display_url,
				alt: edge.node.accessibility_caption,
			}))
		} else {
			continue
		}

		posts.push(post)
	}

	return posts
}

function cleanup() {
	// Delete the downloaded posts.
	rmdirSync(TARGET, { recursive: true })
}

async function main() {
	// Load new posts from Instagram.
	await load()

	// Collect metadata from the downloaded posts.
	const posts = await collect()

	if (!production) {
		Bun.write('./logs/posts.json', JSON.stringify(posts, null, 2), { createPath: true })
	}

	// Save the posts to the database.
	const pb = new Pocketbase('http://db:8080')

	for (const post of posts) {
		const mediaIds: string[] = []

		for (const medium of post.media) {
			const response = await pb.collection<Db.Medium>('media').create({
				// id: medium.id, // this leads to errors...
				url: medium.url,
				alt: medium.alt,
			} satisfies Partial<Db.Medium>)

			mediaIds.push(response.id)
		}

		await pb.collection<Db.Post>('posts').create({
			media: mediaIds,
			caption: post.caption,
			status: 'pending',
		} satisfies Partial<Db.Post>)
	}

	// Cleanup in production.
	if (production) cleanup()
}

await main()
