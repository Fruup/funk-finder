import { browser } from '$app/environment'
import { afterNavigate, beforeNavigate } from '$app/navigation'
import { posthog, type PostHog } from 'posthog-js'

let client: PostHog | null = null

export default {
	init() {
		client =
			posthog.init('phc_fTAEbxHgsFJpc39O4mDmnYvCwaA8a3J5OHropOfXUz6', {
				api_host: 'https://eu.i.posthog.com',
				persistence: 'memory',
				autocapture: false,
				capture_pageview: false,
				capture_pageleave: false,
				disable_compression: import.meta.env.DEV,
			}) || null
	},

	setupNavigationEvents() {
		if (!browser) return

		beforeNavigate(() => posthog.capture('$pageleave'))
		afterNavigate(() => posthog.capture('$pageview'))
	},

	event<EventName extends keyof AnalyticsEvents>(
		name: EventName,
		params: AnalyticsEvents[EventName],
	) {
		this._unsafe((client) => {
			client.capture(name, params)
		})
	},

	_unsafe(f: (client: PostHog) => any) {
		try {
			if (!client) return
			const result = f(client)

			if (result instanceof Promise) {
				result.catch(console.error)
			}
		} catch (e) {
			console.error(e)
		}
	},
}

interface AnalyticsEvents {
	search: {
		query: string
	}
}
