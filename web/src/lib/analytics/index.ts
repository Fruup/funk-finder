import { browser } from '$app/environment'
import { afterNavigate, beforeNavigate } from '$app/navigation'
import { env } from '$env/dynamic/public'
import type { SearchResponseItem } from '$lib/types'
import type { PostHog } from 'posthog-js'

let posthog: PostHog | null = null

export default {
	async init() {
		try {
			return
			posthog = (await import('posthog-js')).default

			posthog.init(env.PUBLIC_POSTHOG_KEY, {
				api_host: 'https://eu.i.posthog.com',
				persistence: 'memory',
				autocapture: false,
				capture_pageview: false,
				capture_pageleave: false,
				disable_compression: import.meta.env.DEV,
			})
		} catch (e) {
			console.error(e)
		}
	},

	setupNavigationEvents() {
		if (!browser) return

		this._unsafe((client) => {
			beforeNavigate(() => client.capture('$pageleave'))
			afterNavigate(() => client.capture('$pageview'))
		})
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
			if (!posthog) return
			const result = f(posthog)

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
	clickItem: {
		item: SearchResponseItem
		id: string
		shortcode: string
	}
}
