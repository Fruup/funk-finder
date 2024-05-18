import { collectAll } from './collect'
import { createEmbeddings } from './embedding'
import { ocrAll } from './ocr'

await collectAll()
await ocrAll()
await createEmbeddings()

console.info('Job done 🎉')
