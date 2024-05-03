import { error, type RequestHandler } from '@sveltejs/kit'
import { search } from '$lib/server/search'
import { events } from 'sveltekit-sse'

export const POST: RequestHandler = async ({ url, request }) =>
	// No code should appear outside the `start` function.
	events({
		request,
		async start({ emit, lock }) {
			const text = url.searchParams.get('q')
			if (!text) return error(400, 'Missing query parameter "q"')

			const { result, updateMediaURLsPromises } = await search(text)

			// First send the search result.
			emit('result', JSON.stringify(result))

			// Then send the updated media URLs.
			// Update one after another (stream-like).
			updateMediaURLsPromises.forEach((promise) => {
				promise.then((value) => {
					if (!value) return
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

			await Promise.all(updateMediaURLsPromises)

			// Close the connection.
			lock.set(false)
		},
	})
