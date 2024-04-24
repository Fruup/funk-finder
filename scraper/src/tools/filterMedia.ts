import { getPocketbase } from '../helpers/config'

if (import.meta.main) {
	const pb = getPocketbase()

	const media = await pb.collection('media').getFullList({
		filter: `text ~ "%danke%post%like%"`,
	})

	console.log(`💡 Found ${media.length} media.`)
}
