import type { SearchResponse } from '$lib/types'
import { source } from 'sveltekit-sse'
import { mockApi } from './mock'
import { writable, type Readable } from 'svelte/store'

export interface API {
	/**
	 * Search for media or posts with the given text.
	 *
	 * To be able to update the response after the promise has been resolved, the response is a readable store.
	 */
	search(text: string): Promise<Readable<SearchResponse>>
}

const api = {
	async search(text) {
		const { promise, resolve } = Promise.withResolvers<Readable<SearchResponse>>()
		const response = writable<SearchResponse>()
		let deferred: Function[] = []

		const connection = source(`/api/v1/search`, {
			close() {
				// Unsubscribe all.
				deferred.forEach((resolve) => resolve())
			},
			options: {
				method: 'POST',
				body: text,
			},
		})

		deferred.push(
			connection
				.select('result')
				.json<SearchResponse>()
				.subscribe((value) => {
					console.log('Received search result:', value)

					if (value) {
						response.set(value)
						resolve(response)
					} else {
						// reject(new Error('Unexpected result value received from the server'))
					}
				}),
		)

		deferred.push(
			connection
				.select('update')
				.json<{ mediumId: string; imageUrl: string }>()
				.subscribe((value) => {
					console.log('Received media URL update:', value)

					if (!value) {
						console.warn("Failed to update media URL. The server didn't send the expected data.")
						return
					}

					const { mediumId, imageUrl } = value

					if (!imageUrl) {
						console.warn('Received an empty URL for the medium with ID:', mediumId)
						return
					}

					// Update the URL of the medium with the given ID.
					response.update((current) =>
						current.map((item) => (item.id === mediumId ? { ...item, imageUrl } : item)),
					)
				}),
		)

		return promise
	},
} satisfies API

export default api
// export default mockApi
