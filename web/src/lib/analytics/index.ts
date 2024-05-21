import { browser } from '$app/environment'
import { afterNavigate, beforeNavigate } from '$app/navigation'
import type { SearchResponseItem } from '$lib/types'
import { v4 } from 'uuid'

let sessionId: string = ''

export default {
	init() {
		if (!browser) return

		sessionId = v4()
	},

	setupNavigationEvents() {
		if (!browser) return

		beforeNavigate(({ from }) => {
			if (!from) return
			this.event('$pageleave', {
				$current_url: from.url.pathname,
			})
		})

		afterNavigate(({ to }) => {
			if (!to) return
			this.event('$pageview', { $current_url: to.url.pathname })
		})
	},

	event<EventName extends keyof AnalyticsEvents>(
		name: EventName,
		params: AnalyticsEvents[EventName],
	) {
		fetch(`/api/v1/analytics?event=${encodeURIComponent(name)}&sessionId=${sessionId}`, {
			body: JSON.stringify(params),
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		})
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
		// rank: number
	}
	$pageview: {
		$current_url: string
	}
	$pageleave: {
		$current_url: string
	}
}
