import { type RequestHandler } from '@sveltejs/kit'
import { search } from '$lib/server/search'
import { events } from 'sveltekit-sse'

export const POST: RequestHandler = async ({ request }) => {
	// No code should appear outside the `start` function.
	return events({
		request,
		async start({ emit, lock }) {
			const text = await request.text()
			if (!text) {
				lock.set(false)
				console.error("Missing 'q' parameter in the query string.")
				return
			}

			const searchResult = await search(text).catch((e) => {
				console.error(e)
				lock.set(false)
				return
			})

			if (!searchResult) return
			const { result, urlUpdatePromises } = searchResult

			// First send the search result.
			emit('result', JSON.stringify(result))

			// Then send the updated media URLs.
			// Update one after another (stream-like).
			urlUpdatePromises.forEach((promise) => {
				promise.then((value) => {
					if (!value.updated) return
					const { mediumId, url } = value

					emit(
						'update',
						JSON.stringify({
							mediumId,
							imageUrl: url,
						}),
					)
				})
			})

			await Promise.all(urlUpdatePromises)

			// Close the connection.
			lock.set(false)
		},
	})
}
