import fs from 'fs'
import path from 'path'

export function checkForLangData(langs: string[]) {
	const notFound: string[] = []
	const tessdata = path.resolve(import.meta.dir, '../../tessdata')

	for (const lang of langs) {
		if (!fs.existsSync(path.join(tessdata, `${lang}.traineddata`))) {
			notFound.push(lang)
		}
	}

	if (notFound.length) {
		const readme = path.resolve(import.meta.dir, '../../tessdata/README.md')
		throw Error(`❌ Language data not found for: ${notFound.join(', ')}. Refer to ${readme}.`)
	} else {
		console.info('✅ Requested language data found.')
	}
}
