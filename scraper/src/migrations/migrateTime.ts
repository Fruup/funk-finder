import Pocketbase, { type RecordModel } from 'pocketbase'
import type { Db } from '@funk-finder/db'
import fs from 'fs'
import { join } from 'path'
import { isImageNode, isSidecarNode, type Metadata } from '../types'
import { readTimeStamp } from '../collect'

const config = {
	target: 'funk',
}

/**
 * This function migrates the `time` field for posts.
 */
export async function migrateTime() {
	const pb = new Pocketbase(import.meta.env.POCKETBASE_PATH)

	// Collect all posts.
	const dir = fs.readdirSync(config.target, { recursive: false, withFileTypes: true })

	for (let i = 0; i < dir.length; ++i) {
		const entry = dir[i]
		if (!entry.isFile()) continue
		if (!entry.name.endsWith('_UTC.json')) continue

		console.info(`(${i}/${dir.length}) Processing "${entry.name}"...`)

		const time = readTimeStamp(entry.name)
		if (!time) {
			console.warn(`WARN: Invalid timestamp in "${entry.name}".`)
			continue
		}

		const metadata: Metadata | null = await Bun.file(join(config.target, entry.name))
			.json()
			.catch((error) => {
				console.error(error)
				return null
			})

		const igId = metadata?.node.id
		if (!igId) {
			console.warn('WARN: Post has no IG ID.')
			continue
		}

		if (!isImageNode(metadata.node) && !isSidecarNode(metadata.node)) continue

		const posts = await pb.collection<Db.Post & RecordModel>('posts').getFullList({
			filter: `igId = "${igId}"`,
		})

		if (posts.length === 0) {
			console.warn(`WARN: Post with IG ID "${igId}" not found.`)
		} else if (posts.length > 1) {
			console.warn(`WARN: Multiple posts with IG ID "${igId}".`)
		} else {
			await pb.collection('posts').update(posts[0].id, { time: new Date(time).toISOString() })

			console.info('✅')
		}
	}
}

if (import.meta.main) {
	await migrateTime()
}
