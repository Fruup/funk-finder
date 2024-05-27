import type * as Db from '@funk-finder/db/types/models'
import { Timing } from '../helpers/timing'
import { getPocketbase } from '../helpers/config'
import { GoogleOcr } from './google'
import { TesseractOcr } from './tesseract'
import { updateMediumURLs } from '../updateMediaURLs'

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
	const scraperApiPath = import.meta.env.SCRAPER_API_PATH!
	if (!scraperApiPath) throw Error('SCRAPER_API_PATH not set')

	const pb = await getPocketbase()

	const media = await pb.collection<Db.Medium<true, 'post'>>('media').getFullList({
		filter: `processed = false`,
		expand: 'post',
	})

	// Separate by post.
	const grouped = Object.entries(Object.groupBy(media, ({ expand }) => expand.post.shortcode))

	// Iterate over each post.
	console.log(`🌈 Processing ${grouped.length} posts...`)
	const timing = new Timing(grouped.length)

	async function iteration(i: number) {
		const [shortcode, media] = grouped[i]
		if (!media?.length) return

		// Update the media URLs.
		await updateMediumURLs(shortcode, { pb, scraperApiPath, media })

		// Perform OCR on the media in parallel.
		await Promise.all(
			media.map(async (medium) => {
				try {
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
					console.error('❌', error, medium.url)
				}
			}),
		)

		timing.update()
	}

	// Run in parallel.
	const length = 8
	await Promise.all(
		Array.from({ length }, async (_, i) => {
			while (i < grouped.length) {
				await iteration(i).catch(console.error)
				i += length
			}
		}),
	)

	timing.finish()
}
