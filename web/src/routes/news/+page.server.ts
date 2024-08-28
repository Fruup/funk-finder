import { getPocketbase } from '$lib/server/init'
import type { News } from '@funk-finder/db/types/models'

export const load = async ({}) => {
	const pb = await getPocketbase()
	const news = await pb.collection<News<true>>('news').getFullList()

	return {
		news,
	}
}
