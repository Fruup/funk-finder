import { error, json, type RequestHandler } from '@sveltejs/kit'
import { search } from '$lib/server/search'

export const GET: RequestHandler = async ({ url }) => {
	const text = url.searchParams.get('q')
	if (!text) return error(400, 'Missing query parameter "q"')

	return json(await search(text))
}
