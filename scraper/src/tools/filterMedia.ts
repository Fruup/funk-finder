/**
 * WORK IN PROGRESS
 */

import type { Db } from '@funk-finder/db'
import { getChroma, getPocketbase } from '../helpers/config'
import Pocketbase from 'pocketbase'
import { IncludeEnum, type Collection, type IEmbeddingFunction } from 'chromadb'
import fs from 'fs/promises'
import type { Metadata } from '../types'
import type { ServeOptions } from 'bun'

async function getPureImageMedia1(pb: Pocketbase) {
	return await pb.collection<Db.Medium<true, 'post'>>('media').getFullList({
		filter: `text ~ "%danke%post%like%"`,
		expand: 'post',
	})
}

async function getPureImageMedia2(
	mediaCollection: Collection,
	embeddingFunction: IEmbeddingFunction,
	pb: Pocketbase,
) {
	const queryString = `DANKE, DASS IHR AUCH INFO-POSTS EINEN LIKE GEBT`
	const queryEmbedding = await (async () => {
		const embedding = (await embeddingFunction.generate([queryString]))[0]
		// await Bun.write('queryEmbedding.json', JSON.stringify(embedding))
		return embedding
	})()

	const result = await mediaCollection.query({
		queryEmbeddings: queryEmbedding,
		where: { type: 'medium' },
		nResults: 10000,
		include: [IncludeEnum.Distances, IncludeEnum.Metadatas],
	})

	pb.autoCancellation(false)

	const promises = result.ids[0].map(async (id, index) => {
		const type = (result.metadatas![0][index] as { type: 'medium' | 'post' }).type
		const distance = result.distances![0][index]

		try {
			if (type === 'post') {
				const post = await pb.collection<Db.Post<true>>('posts').getOne(id)
				return { id, type, distance, text: post.caption, shortcode: post.shortcode, url: null }
			} else {
				const medium = await pb
					.collection<Db.Medium<true, 'post'>>('media')
					.getOne(id, { expand: 'post' })
				return {
					id,
					type,
					distance,
					text: medium.text,
					shortcode: medium.expand.post.shortcode,
					url: medium.url,
				}
			}
		} catch (e) {
			console.log(e)
			return null
		}
	})

	return (await Promise.all(promises)).filter((m): m is Exclude<typeof m, undefined | null> => !!m)
}

if (import.meta.main) {
	const pb = await getPocketbase()
	const { chroma, mediaCollection, embeddingFunction } = await getChroma()

	let media = await getPureImageMedia2(mediaCollection, embeddingFunction, pb)
	// media = media.filter((m) => m.distance < 0.5)

	// const ids = media.map(({ id }) => id)
	// const metadatas = media.map(({ type }) => ({ type, isPureImage: true }))
	// await mediaCollection.delete({ ids })

	// TODO ALSO MARK AS EXCLUDED IN POCKETBASE

	const rows = media.map(({ id, url, text, shortcode, distance, type }) => {
		return `
			<tr>
				<td>${id}</td>
				<td>${shortcode}</td>
				<td>${type}</td>
				<td><a href="${url}" target="_blank">link</a></td>
				<td>${distance}</td>
				<td>${text}</td>
			</tr>`
	})

	const html = `
		<table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Shortcode</th>
					<th>Type</th>
					<th>URL</th>
					<th>Distance</th>
					<th>Text</th>
				</tr>
			</thead>
			<tbody>
				${rows.join('')}
			</tbody>
		</table>
	`

	// await Bun.write('filterMedia.html', html)

	Bun.serve<ServeOptions>({
		port: 80,
		async fetch(request, server) {
			const url = new URL(request.url)
			console.log(request.method, url.pathname)

			if (url.pathname === '/') {
				// const html = await Bun.file('filterMedia.html').text()
				return new Response(html, { headers: { 'Content-Type': 'text/html' } })
			}
		},
		// @ts-ignore
		websocket: null,
	})

	console.log(`💡 Found ${media.length} media.`)
}
