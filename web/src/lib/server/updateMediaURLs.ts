export async function updateMediaURLs(mediaIds: string[]) {
	const host = 'scraper.funk-finder.orb.local'
	const response = await fetch(`http://${host}/updateMediaURLs?ids=${mediaIds.join(',')}`)

	if (!response.ok) {
		console.warn(
			'Update media URLs request failed:',
			response.status,
			response.statusText,
			await response.json(),
		)

		return []
	} else {
		return (await response.json()) as { mediumId: string; url: string }[]
	}
}
