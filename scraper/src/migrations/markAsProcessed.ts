import { getPocketbase } from '../helpers/config'

const pb = await getPocketbase()

const media = await pb.collection('media').getFullList()

for (let i = 0; i < media.length; ++i) {
	const medium = media[i]

	await pb.collection('media').update(medium.id, { processed: true })
	console.info(`(${i + 1}/${media.length}) Updated ${medium.id}.`)
}
