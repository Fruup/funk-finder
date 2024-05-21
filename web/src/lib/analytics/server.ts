import { env } from '$env/dynamic/public'
import { getPocketbase } from '$lib/server/init'
import { ClientResponseError } from 'pocketbase'
import { PostHog } from 'posthog-node'

interface AnalyticsServer {
	init(): void
	capture(name: string, params: object, sessionId: string): void | Promise<void>
}

class PosthogAnalyticsServer implements AnalyticsServer {
	posthog: PostHog | null = null

	init() {
		this.posthog = new PostHog(env.PUBLIC_POSTHOG_KEY, {
			host: 'https://eu.i.posthog.com',
		})
	}

	capture(name: string, params: object, sessionId: string) {
		if (!this.posthog) return

		try {
			console.log('Capture event:', name, params)

			this.posthog.capture({
				distinctId: sessionId,
				event: name,
				properties: params,
				disableGeoip: true,
			})
		} catch (e) {
			console.warn(e)
		}
	}
}

class PocketbaseAnalyticsServer implements AnalyticsServer {
	init() {}

	async capture(name: string, params: object, sessionId: string) {
		console.log('Capture event:', name, params, sessionId)

		try {
			const pb = await getPocketbase()
			await pb.collection('analyticsEvents').create({
				name,
				payload: params,
				sessionId,
			})
		} catch (e) {
			if (e instanceof ClientResponseError) {
				console.error(JSON.stringify(e.toJSON(), null, 2))
			} else {
				throw e
			}
		}
	}
}

// export const analyticsServer: AnalyticsServer = new PosthogAnalyticsServer()
export const analyticsServer: AnalyticsServer = new PocketbaseAnalyticsServer()

analyticsServer.init()
