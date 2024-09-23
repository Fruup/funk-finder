import { collectAll } from './collect'
import { createEmbeddings } from './embedding'
import { ocrAll } from './ocr'

if (Bun.argv.includes('collect')) {
	console.log('Collecting...')
	await collectAll()
}

if (Bun.argv.includes('ocr')) {
	console.log('OCR...')
	await ocrAll()
}

if (Bun.argv.includes('embedding')) {
	console.log('Embedding...')
	await createEmbeddings()
}

console.info('Job done 🎉')
