import fs from 'fs'
import { execSync } from 'child_process'
import Pocketbase from 'pocketbase'
import type * as Db from '@funk-finder/db/types/models'

export async function ocr(options: {
	file?: string
	url?: string
	tempDir?: string
	psm?: number
	langs?: string[]
	output?: string
}) {
	let input: string
	let output: string // without extension, tesseract will add .txt

	const tempDir = options.tempDir || '.tmp'

	if (options.url) {
		fs.mkdirSync(tempDir, { recursive: true })
		const filename = id()

		input = `${tempDir}/${filename}.jpg`
		output = `${tempDir}/${filename}`

		// Download the image.
		execSync(`curl -s -o "${input}" "${options.url}"`)
	} else if (options.file) {
		input = options.file
		output = input
	} else {
		throw new Error('No file or URL provided.')
	}

	// Perform OCR.
	execSync(
		`
		tesseract \
			--tessdata-dir ./tessdata \
			${input} \
			${options.output || output} \
			-l ${options.langs?.join('+') || 'deu+eng'} \
			--psm ${options.psm ?? 3}
	`,
		{ stdio: 'inherit' },
	)

	const text = await Bun.file(output + '.txt').text()

	return text.trim().replaceAll(/\s+/g, ' ')

	// TODO: delete files
}

const id = () => Math.floor(0xffffffff * Math.random()).toString(16)

if (import.meta.main) {
	const pb = new Pocketbase(import.meta.env.POCKETBASE_PATH)

	const media = await pb.collection<Db.Medium<true>>('media').getFullList({
		filter: `processed = false`,
	})

	const timing = {
		start: Date.now(),
		n: 0,
		elapsed: 0,
		update(_n: number) {
			this.n = _n
			this.elapsed = Date.now() - this.start
		},
		progress() {
			return `${timing.n.toString().padStart(media.length.toString().length, ' ')}/${media.length}`
		},
		eta() {
			const t = (this.elapsed / this.n) * (media.length - this.n)
			const time = new Date()
			time.setMilliseconds(time.getMilliseconds() + t)
			return time
		},
		elapsedTime() {
			const hours = Math.floor(this.elapsed / 1000 / 60 / 60)
			const minutes = Math.floor((this.elapsed / 1000 / 60) % 60)
			const seconds = Math.floor((this.elapsed / 1000) % 60)

			return (
				`${hours.toString().padStart(2, '0')}:` +
				`${minutes.toString().padStart(2, '0')}:` +
				`${seconds.toString().padStart(2, '0')}`
			)
		},
	}

	for (let i = 0; i < media.length; ++i) {
		const medium = media[i]
		if (!medium.url) continue

		timing.update(i)

		try {
			console.log(`💡 (${timing.progress()})`, `Processing "${medium.id}"...`)

			const text = await ocr({ url: medium.url })

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
		console.log(`🕒 Elapsed: ${timing.elapsedTime()} | ETA: ${timing.eta().toLocaleString()}`)
	}
}
