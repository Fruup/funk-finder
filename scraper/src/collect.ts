import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { join } from 'node:path'
import { isImageNode, isSidecarNode, type Metadata, type Post } from './types'
import { ClientResponseError, type RecordModel } from 'pocketbase'
import type * as Db from '@funk-finder/db/types/models'
import { toArray } from './helpers/misc'
import { readLine } from './helpers/readLine'
import { getPocketbase } from './helpers/config'

const production = process.env.NODE_ENV === 'production'

const config = {
	target: 'funk',
	// target: 'leonmaj7',
}

export async function loadPosts(target: { posts?: string | string[]; profile?: string }) {
	let targetArgument = ''
	if (target.posts) {
		targetArgument =
			'-- ' +
			toArray(target.posts)
				.map((id) => `-${id}`)
				.join(' ')
	} else if (target.profile) {
		targetArgument = target.profile
	} else {
		throw new Error('No target specified.')
	}

	// Login is skipped for now.

	execSync(
		`
    instaloader \\
      --no-pictures \\
      --no-videos \\
      --no-profile-pic \\
      --no-compress-json \\
      --latest-stamps ./state/timestamps.ini \\
      ${targetArgument}
  `,
		{ stdio: 'inherit' },
	)

	// --load-cookies Firefox \
	// --cookiefile ./state/cookies.sqlite \
	// --login leonmaj7 \
}

export const readTimeStamp = (filename: string): number | null => {
	const regexp = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/g
	const match = regexp.exec(filename)
	if (!match) return null

	const [year, month, date, hour, minute, second] = match.slice(1).map(Number)

	return Date.UTC(year, month - 1, date, hour, minute, second)
}

export async function collect(target: string) {
	const posts: Post[] = []
	const dir = fs.readdirSync(target, { recursive: false, withFileTypes: true })

	for (const entry of dir) {
		if (!entry.isFile()) continue
		if (!entry.name.endsWith('_UTC.json')) continue

		console.info(`Processing "${entry.name.replaceAll(/\s+/g, ' ')}"...`)

		const caption = await Bun.file(join(target, entry.name.slice(0, -5) + '.txt'))
			.text()
			.catch(() => '')

		const metadata: Metadata | null = await Bun.file(join(target, entry.name))
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
			time: readTimeStamp(entry.name),
			igId: metadata.node.id,
		}

		if (isImageNode(metadata.node)) {
			post.media = [
				{
					url: metadata.node.display_url,
					alt: metadata.node.accessibility_caption,
					igId: metadata.node.id,
				},
			]
		} else if (isSidecarNode(metadata.node)) {
			post.media = metadata.node.edge_sidecar_to_children.edges
				.map((edge) => edge.node)
				.filter(isImageNode)
				.map((node) => ({
					url: node.display_url,
					alt: node.accessibility_caption,
					igId: node.id,
				}))
		} else {
			// Skip videos for now.
			continue
		}

		posts.push(post)
	}

	return posts
}

async function writeTimestampsFile(file?: string, time?: Date) {
	if (!time) {
		// Get the last post's timestamp.
		const pb = await getPocketbase()
		const response = await pb
			.collection<Db.Post & RecordModel>('posts')
			.getFirstListItem('time != null', { sort: '-time' })

		if (!response.time) return
		time = new Date(response.time)
	}

	if (!time) return
	const timestamp = time.toISOString()

	console.log(`Writing timestamp "${timestamp}" to file.`)

	await Bun.write(
		file || './state/timestamps.ini',
		//
		`[funk]\n` + //
			`profile-id = 9543220683\n` +
			`post-timestamp = ${timestamp}\n`,
	)
}

function cleanup() {
	// Delete the downloaded posts.
	fs.rmdirSync(config.target, { recursive: true })
}

export async function collectAll() {
	let posts: Post[]

	await writeTimestampsFile()

	if (!production && !(await readLine('Continue? (y/n)'))) {
		process.exit(0)
	}

	// Load new posts from Instagram.
	await loadPosts({ profile: config.target })

	// Collect metadata from the downloaded posts.
	posts = await collect(config.target)

	// Save the posts to the database.
	const pb = await getPocketbase()

	for (const post of posts) {
		try {
			console.log(`Working on "${post.caption.slice(0, 64).replace(/\s+/g, ' ') + '...'}"`)

			const postRecord = await pb.collection<RecordModel & Db.Post>('posts').create({
				caption: post.caption,
				shortcode: post.shortcode,
				igId: post.igId,
				time: post.time ? new Date(post.time).toISOString() : undefined,
			} satisfies Partial<Db.Post>)

			for (const medium of post.media) {
				await pb.collection('media').create({
					url: medium.url,
					alt: medium.alt ?? undefined,
					igId: medium.igId,
					post: postRecord.id,
				} satisfies Partial<Db.Medium>)
			}
		} catch (error) {
			console.error(`Error for post "${post.shortcode}":`)

			if (error instanceof ClientResponseError) {
				if (error.status === 400) {
					console.warn('Bad request:')
					console.error(JSON.stringify(error.originalError, null, 2))
				} else {
					console.error(JSON.stringify(error.toJSON(), null, 2))
				}
			} else {
				console.error(error)
			}
		}
	}

	// Cleanup in production.
	if (production) cleanup()
}

if (import.meta.main) {
	await collectAll()
}
