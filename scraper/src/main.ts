import { execSync } from 'node:child_process'
import { readdirSync, rmdirSync } from 'node:fs'
import { join } from 'node:path'
import { isImageNode, type Metadata, type Post } from './types'
import Pocketbase, { type RecordModel } from 'pocketbase'
import type * as Db from '@funk-finder/db/types/models'

const production = process.env.NODE_ENV === 'production'
const TARGET = 'funk'
// const TARGET = 'leonmaj7'

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

		console.info(`Processing "${entry.name}"...`)

		const caption = await Bun.file(join(TARGET, entry.name.slice(0, -5) + '.txt'))
			.text()
			.catch(() => '')

		const metadata: Metadata | null = await Bun.file(join(TARGET, entry.name))
			.json()
			.catch((error) => {
				console.error(error)
				return null
			})

		if (metadata === null) continue

		if (!metadata.node.shortcode) {
			console.warn('WARN: Post has no shortcode.')
		}

		const post: Post = {
			caption: caption.trim(),
			shortcode: metadata.node.shortcode ?? '',
			media: [],
		}

		if (metadata.node.__typename === 'GraphImage') {
			post.media = [
				{
					url: metadata.node.display_url,
					alt: metadata.node.accessibility_caption,
				},
			]
		} else if (metadata.node.__typename === 'GraphSidecar') {
			post.media = metadata.node.edge_sidecar_to_children.edges
				.map((edge) => edge.node)
				.filter(isImageNode)
				.map((node) => ({
					url: node.display_url,
					alt: node.accessibility_caption,
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
	// await load()

	// Collect metadata from the downloaded posts.

	// const posts = await collect()

	// if (!production) {
	// 	Bun.write('./logs/posts.json', JSON.stringify(posts, null, 2), { createPath: true })
	// }

	const posts: Post[] = await Bun.file('./logs/posts.json').json()

	// Save the posts to the database.
	const pb = new Pocketbase('http://host.docker.internal:8090')
	// const pb = new Pocketbase('http://db:8080')

	for (const post of posts.slice(601, 605)) {
		try {
			console.log(`Working on "${post.caption.slice(0, 32) + '...'}"`)

			const postRecord = await pb.collection<RecordModel & Db.Post>('posts').create({
				caption: post.caption,
				shortcode: post.shortcode,
			} satisfies Partial<Db.Post>)

			if (!postRecord?.id) {
				continue
			}

			for (const medium of post.media) {
				await pb.collection('media').create({
					url: medium.url,
					alt: medium.alt ?? undefined,
					post: postRecord.id,
				} satisfies Partial<Db.Medium<false>>)
			}
		} catch (error) {
			console.error(error)
		}
	}

	// Cleanup in production.
	// if (production) cleanup()
}

await main()
