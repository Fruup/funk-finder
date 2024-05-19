import { init } from '$lib/server/init'
import { error, text } from '@sveltejs/kit'
import { ClientResponseError, type RecordModel } from 'pocketbase'

export const POST = async ({ params }) => {
	if (!params.featureId) throw error(400, 'No featureId provided')

	const { pb } = await init()
	const featuresCollection = pb.collection<{ name: string; pushes: number } & RecordModel>(
		'features',
	)

	try {
		const feature = await featuresCollection.getFirstListItem(`name = "${params.featureId}"`)
		await featuresCollection.update(feature.id, { pushes: feature.pushes + 1 })
	} catch (e) {
		if (e instanceof ClientResponseError && e.status !== 404) throw e

		await featuresCollection.create({ name: params.featureId, pushes: 1 })
	}

	return text('Ok', { status: 200 })
}
