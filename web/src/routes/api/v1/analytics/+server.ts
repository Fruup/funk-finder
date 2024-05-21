import { analyticsServer } from '$lib/analytics/server'
import { error } from '@sveltejs/kit'

export const POST = async ({ url, request }) => {
	const event = url.searchParams.get('event')
	if (!event) throw error(400, 'Missing event name')

	const sessionId = url.searchParams.get('sessionId')
	if (!sessionId) throw error(400, 'Missing sessionId')

	const payload = await request.json()

	await analyticsServer.capture(event, payload, sessionId)

	return new Response()
}
