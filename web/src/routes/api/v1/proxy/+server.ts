import { error, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url }) => {
	const urlToProxy = url.searchParams.get('q')
	if (!urlToProxy) throw error(400, 'Missing query parameter "q".')

	const response = await fetch(urlToProxy)

	return new Response(response.body, {
		headers: {
			...response.headers,

			// TODO
			'Access-Control-Allow-Origin': import.meta.env.DEV ? '*' : 'TODO',
		},
	})
}
