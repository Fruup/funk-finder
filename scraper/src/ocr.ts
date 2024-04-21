import fs from 'fs'
import { execSync } from 'child_process'

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
			--psm ${options.psm ?? 3} \
			--oem 2 \
	`,
		{ stdio: 'inherit' },
	)

	const text = await Bun.file(output + '.txt').text()

	return text.trim().replaceAll(/\s+/g, ' ')

	// TODO: delete files
}

const id = () => Math.floor(0xffffffff * Math.random()).toString(16)
