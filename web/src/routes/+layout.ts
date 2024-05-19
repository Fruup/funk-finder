import { browser } from '$app/environment'
import analytics from '$lib/analytics'

export const prerender = true

export const load = async () => {
	if (browser) {
		analytics.init()
	}
}
