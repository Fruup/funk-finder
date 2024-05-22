import { getPocketbase } from '$lib/server/init'
import { ClientResponseError } from 'pocketbase'

interface AnalyticsServer {
	init(): void
	capture(name: string, params: object): void | Promise<void>
}

class PocketbaseAnalyticsServer implements AnalyticsServer {
	init() {}

	async capture(name: string, params: object) {
		try {
			const pb = await getPocketbase()
			await pb.collection('analyticsEvents').create({
				name,
				payload: params,
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
