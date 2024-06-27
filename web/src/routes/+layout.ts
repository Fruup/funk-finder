import { browser } from '$app/environment'
import analytics from '$lib/analytics'

export const prerender = true

export const load = async () => {
	if (!browser) return

	// Fetch build info.
	fetch('/buildInfo.txt').then(async (response) => {
		console.log('ℹ️ Build Info')
		const text = await response.text()
		try {
			console.table(JSON.parse(text))
		} catch {
			console.info(text)
		}
	})

	analytics.init()
}
