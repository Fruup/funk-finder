import type * as Db from '@funk-finder/db/types/models'
import { Timing } from '../helpers/timing'
import { getPocketbase } from '../helpers/config'
import { GoogleOcr } from './google'
import { TesseractOcr } from './tesseract'
import { isUrlOk, updateMediumURL } from '../updateMediaURLs'

export interface OcrBase {
	readonly name: string
	ocr(url: string): string | Promise<string>
}

const engine: OcrBase = (() => {
	const backend = import.meta.env.OCR_BACKEND?.toLowerCase()
	const backendOptions = JSON.parse(import.meta.env.OCR_BACKEND_OPTIONS || '{}')

	if (backend === 'tesseract') return new TesseractOcr(backendOptions)
	else return new GoogleOcr(backendOptions)
})()

export async function ocr(url: string) {
	// Perform OCR.
	const text = await engine.ocr(url)

	// Normalize whitespace.
	return text.trim().replaceAll(/\s+/g, ' ')
}

export async function ocrAll() {
	const scraperApiPath = import.meta.env.SCRAPER_API_PATH
	if (!scraperApiPath) throw Error('SCRAPER_API_PATH not set')

	const pb = await getPocketbase()

	const media = await pb.collection<Db.Medium<true, 'post'>>('media').getFullList({
		filter: `processed = false`,
		expand: 'post',
	})

	const timing = new Timing(media.length)

	for (let i = 0; i < media.length; ++i) {
		const medium = media[i]
		if (!medium.url) continue

		try {
			// Check if the URL is still valid, otherwise update it.
			if (!(await isUrlOk(medium.url))) {
				medium.url = await updateMediumURL(medium.id, { pb, scraperApiPath })
			}

			// Perform OCR and update the DB entry.
			const text = await ocr(medium.url)

			await pb.collection<Db.Medium<true>>('media').update(medium.id, {
				text,
				processed: true,
				extra: {
					...medium.extra,
					ocrEngine: engine.name,
				},
			})

			if (!text) {
				console.log('    -> No text extracted.')
			} else {
				console.log(`    -> Extracted text "${text.slice(0, 50)}..."`)
			}
		} catch (error) {
			console.error('❌', error)
		}

		timing.update(i)
	}

	timing.finish()
}
