import Pocketbase from 'pocketbase'
import type * as Db from '@funk-finder/db/types/models'

export const load = async () => {
	const pb = new Pocketbase('http://localhost:8080')

	const posts = pb.collection<Db.Post>('posts').getFullList({
		filter: `status = 'finished' && media != null`,
	})

	return {
		posts,
	}
}
