import express from 'express'
import { updateMediaURLs } from './src/updateMediaURLs'
import { getPocketbase } from './src/helpers/config'

const app = express()
const pb = getPocketbase()

app.get('/updateMediaURLs', async (req, res) => {
	const { ids } = req.query
	if (typeof ids !== 'string') {
		return res.status(400).send('ids must be a string')
	}

	const mediaIds = ids.split(',')

	console.info('Updating media URLs for', mediaIds)

	const result = await updateMediaURLs(mediaIds, { pb })
	return res.status(200).json(result)
})

app.listen(3000, () => console.log(`⚡️ Server running on http://localhost:3000`))
