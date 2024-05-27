import { error, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, fetch }) => {
	const urlToProxy = url.searchParams.get('q')
	if (!urlToProxy) throw error(400, 'Missing query parameter "q".')

	try {
		const response = await fetch(urlToProxy)
		if (!response.ok) throw error(400)

		return new Response(response.body, {
			headers: {
				...response.headers,

				// TODO: This does not work currently...
				// 'Access-Control-Allow-Origin': import.meta.env.DEV ? '*' : import.meta.env.ORIGIN,
				// Vary: 'Origin',
			},
		})
	} catch (e) {
		throw error(400)
	}
}
