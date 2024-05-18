import { execSync } from 'child_process'
import type * as Db from '@funk-finder/db/types/models'
import { checkForLangData } from './helpers/checkForLangData'
import { Timing } from './helpers/timing'
import { getPocketbase } from './helpers/config'

const config = {
	langs: ['deu', 'eng'],
}

export function ocr(
	url: string,
	options: {
		psm?: number
		langs?: string[]
	} = {},
) {
	const { langs = config.langs, psm = 3 } = options

	// Perform OCR. Pipe the image data to tesseract.
	const text = execSync(
		[
			`curl -s "${url}"`,
			`|`,
			`tesseract`,
			`--tessdata-dir ./tessdata`,
			`stdin`,
			`stdout`,
			`-l ${langs.join('+')}`,
			`--psm ${psm}`,
		].join(' '),
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
	)

	return text.trim().replaceAll(/\s+/g, ' ')
}

export async function ocrAll() {
	// Check for requested language data.
	checkForLangData([...config.langs, 'osd'])

	const pb = await getPocketbase()

	const media = await pb.collection<Db.Medium<true>>('media').getFullList({
		filter: `processed = false`,
	})

	const timing = new Timing(media.length)

	for (let i = 0; i < media.length; ++i) {
		const medium = media[i]
		if (!medium.url) continue

		try {
			const text = ocr(medium.url)

			await pb.collection<Db.Medium<true>>('media').update(medium.id, { text, processed: true })

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
}
