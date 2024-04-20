import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { join } from 'node:path'
import { isImageNode, isSidecarNode, type Metadata, type Post } from './types'
import Pocketbase, { type RecordModel } from 'pocketbase'
import type * as Db from '@funk-finder/db/types/models'

const production = process.env.NODE_ENV === 'production'

const config = {
	// pocketbasePath: 'http://localhost:8080',
	pocketbasePath: 'http://host.docker.internal:8080',
	target: 'funk',
	// target: 'leonmaj7',
	tempDir: '.tmp',
}

async function loadPosts() {
	execSync(
		`
    instaloader \
      --no-pictures \
      --no-videos \
      --no-profile-pic \
      --no-compress-json \
      --latest-stamps ./state/timestamps.ini \
      ${config.target}
  `,
		{ stdio: 'inherit' },
	)

	// --login leonmaj7 \
}

const readTimeStamp = (filename: string) => {
	const regexp = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/g
	const match = filename.match(regexp)
	if (!match) return null

	const [year, month, date, hour, minute, second] = match.slice(1).map(parseInt)

	return Date.UTC(year, month - 1, date, hour, minute, second)
}

async function collect() {
	const posts: Post[] = []
	const dir = fs.readdirSync(config.target, { recursive: false, withFileTypes: true })

	for (const entry of dir) {
		if (!entry.isFile()) continue
		if (!entry.name.endsWith('_UTC.json')) continue

		console.info(`Processing "${entry.name.replaceAll(/\s+/g, ' ')}"...`)

		const caption = await Bun.file(join(config.target, entry.name.slice(0, -5) + '.txt'))
			.text()
			.catch(() => '')

		const metadata: Metadata | null = await Bun.file(join(config.target, entry.name))
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
		}

		if (isImageNode(metadata.node)) {
			post.media = [
				{
					url: metadata.node.display_url,
					alt: metadata.node.accessibility_caption,
				},
			]
		} else if (isSidecarNode(metadata.node)) {
			post.media = metadata.node.edge_sidecar_to_children.edges
				.map((edge) => edge.node)
				.filter(isImageNode)
				.map((node) => ({
					url: node.display_url,
					alt: node.accessibility_caption,
				}))
		} else {
			// Skip videos for now.
			continue
		}

		posts.push(post)
	}

	return posts
}

const id = () => Math.floor(0xffffffff * Math.random()).toString(16)

async function ocr(url: string) {
	fs.mkdirSync(config.tempDir, { recursive: true })
	const filename = id()
	const input = `${config.tempDir}/${filename}.jpg`
	const output = `${config.tempDir}/${filename}`

	// Download the image.
	execSync(`curl -s -o "${input}" "${url}"`)

	// Perform OCR.
	execSync(
		`
		tesseract \
			--tessdata-dir ./tessdata \
			${input} \
			${output} \
			-l deu+eng \
			--psm 3
	`,
		{ stdio: 'inherit' },
	)

	const text = await Bun.file(output + '.txt').text()

	// TODO: delete files

	return text.trim()
}

function cleanup() {
	// Delete the downloaded posts.
	// fs.rmdirSync(config.target, { recursive: true })

	// Delete downloaded images.
	fs.rmdirSync(config.tempDir, { recursive: true })
}

async function main() {
	let posts: Post[]

	if (true) {
		// Load new posts from Instagram.
		await loadPosts()

		// Collect metadata from the downloaded posts.
		posts = await collect()

		if (!production) {
			Bun.write('./logs/posts.json', JSON.stringify(posts, null, 2), { createPath: true })
		}
	} else {
		posts = await Bun.file('./logs/posts.json').json()
	}

	// Save the posts to the database.
	const pb = new Pocketbase(config.pocketbasePath)

	for (const post of posts) {
		try {
			console.log(`Working on "${post.caption.slice(0, 64).replace(/\s+/g, ' ') + '...'}"`)

			const mediaIds: string[] = []

			for (const medium of post.media) {
				const text = await ocr(medium.url)

				await pb.collection('media').create({
					url: medium.url,
					alt: medium.alt ?? undefined,
					text,
				} satisfies Partial<Db.Medium<false>>)
			}

			await pb.collection<RecordModel & Db.Post<false>>('posts').create({
				caption: post.caption,
				shortcode: post.shortcode,
				media: mediaIds,
			} satisfies Partial<Db.Post<false>>)
		} catch (error) {
			console.error(error)
		}
	}

	// Cleanup in production.
	// if (production) cleanup()
}

if (import.meta.main) {
	await main()
}
