import { error, type RequestHandler } from '@sveltejs/kit'
import { search } from '$lib/server/search'
import { produce } from 'sveltekit-sse'
import type { SearchEvents } from './types'
import type { MediaUrlUpdate } from '$lib/server/updateMediaURLs'
import { AsyncQueue } from '$lib/utils/queue'

export const POST: RequestHandler = async ({ request }) => {
	const text = await request.text()
	if (!text) throw error(400, 'Missing text in the request body.')

	let stopped = false

	try {
		const searchResult = await search(text)

		return produce(
			async ({ emit, lock }) => {
				const { result, urlUpdatePromises } = searchResult

				// First send the search result.
				emit('result', JSON.stringify(result satisfies SearchEvents['result']))

				// Ensure that only on `emit` is running at a time.
				const queue = new AsyncQueue()

				const asyncUpdate = (update: MediaUrlUpdate) =>
					new Promise<void>((resolve, reject) => {
						const result = emit('update', JSON.stringify(update satisfies SearchEvents['update']))
						if (result.error) reject(result.error)
						else resolve(result.value)
					})

				// Then send the updated media URLs.
				// Update one after another (stream-like).
				await Promise.all(
					urlUpdatePromises.map(async (promise) => {
						if (stopped) return

						try {
							const value = await promise
							if (!value) return

							await queue.enqueue(() => asyncUpdate(value))
						} catch (e) {
							console.error(e)
						}
					}),
				)

				while (queue.size > 0) {
					await queue.dequeue()
				}

				// Close the connection.
				lock.set(false)
			},
			{
				stop() {
					stopped = true
				},
			},
		)
	} catch (e) {
		throw e
	}
}
