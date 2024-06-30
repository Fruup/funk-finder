import type { SearchResponse } from '$lib/types'
import { source } from 'sveltekit-sse'
import type { SearchEvents } from '../../../routes/api/v1/search/types'

interface APIv2 {
	/**
	 * Search for media or posts with the given text.
	 *
	 * To be able to update the response after the promise has been resolved, the response is a readable store.
	 */
	search(text: string): Promise<{ searchResponse: SearchResponse; abort: () => void }>
}

export const apiV2 = {
	async search(text) {
		const { promise, resolve } = Promise.withResolvers<Awaited<ReturnType<APIv2['search']>>>()
		let deferred: Function[] = []
		let response = $state<SearchResponse>()

		function abort() {
			// Close the connection.
			connection.close()
		}

		const connection = source(`/api/v1/search`, {
			close() {
				// Unsubscribe all.
				deferred.forEach((resolve) => resolve())
			},
			error(e) {
				console.error('Connection error:', e)
			},
			options: {
				method: 'POST',
				body: text,
			},
		})

		deferred.push(
			connection
				.select('result')
				.json()
				.subscribe((value: SearchEvents['result']) => {
					console.log('Received search result:', value)

					if (value) {
						response = value
						resolve({ searchResponse: response, abort })
					} else {
						// reject(new Error('Unexpected result value received from the server'))
					}
				}),
		)

		deferred.push(
			connection
				.select('update')
				.json()
				.subscribe((value: SearchEvents['update']) => {
					console.log('Received media URL update:', value)

					if (!value) {
						console.warn("Failed to update media URL. The server didn't send the expected data.")
						return
					}

					const { id, url, type } = value

					if (!url) {
						console.warn('Received an empty URL for the item with ID:', id, `(type: ${type})`)
						return
					}

					// Update the URL of the item (medium or post) with the given ID.
					const found = response?.find((item) => item.id === id)
					if (found) found.imageUrl = url
				}),
		)

		return promise
	},
} satisfies APIv2
