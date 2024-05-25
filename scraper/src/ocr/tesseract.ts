import type { OcrBase } from '.'
import { execSync } from 'child_process'
import { checkForLangData } from '../helpers/checkForLangData'

interface TesseractOcrOptions {
	psm: number
	langs: string[]
}

export class TesseractOcr implements OcrBase {
	private options: TesseractOcrOptions
	readonly name = 'tesseract'

	constructor(options: Partial<TesseractOcrOptions> = {}) {
		this.options = {
			psm: 3,
			langs: ['deu', 'eng'],
			...options,
		}

		// Check for requested language data.
		checkForLangData([...this.options.langs, 'osd'])
	}

	ocr(url: string) {
		// Perform OCR. Pipe the image data to tesseract.
		return execSync(
			[
				`curl -s "${url}"`,
				`|`,
				`tesseract`,
				`--tessdata-dir ./tessdata`,
				`stdin`,
				`stdout`,
				`-l ${this.options.langs.join('+')}`,
				`--psm ${this.options.psm}`,
			].join(' '),
			{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
		)
	}
}
