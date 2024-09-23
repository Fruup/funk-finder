import type { OcrBase } from '.'
import { execSync } from 'child_process'
import type { RootObject } from './helpers/googleResponseSchema'
import fs from 'fs'

export class GoogleOcr implements OcrBase {
	readonly name = 'google'

	constructor(options?: {
		/**
		 * The name of the environment variable that contains the the Google Cloud service service account key.
		 * Expects the key to be encoded in base64.
		 */
		keyEnvVar?: string
	}) {
		const { keyEnvVar = 'GCLOUD_KEY' } = options || {}

		// Write key to file.
		const keyFile = '/tmp/gcloud-key.json'
		const encodedKey = import.meta.env[keyEnvVar]
		if (!encodedKey) throw Error(`Environment variable "${keyEnvVar}" has no value.`)
		const key = Buffer.from(encodedKey, 'base64').toString('utf-8')
		fs.writeFileSync(keyFile, key)

		// Authenticate gcloud.
		console.log('🔑 Authenticating gcloud...')
		execSync(`gcloud auth activate-service-account --key-file="${keyFile}"`)
		console.log('🔑 Success!')

		// Delete key file.
		fs.rmSync(keyFile)
	}

	public async ocr(url: string) {
		let resultText: string

		try {
			resultText = execSync(`gcloud ml vision detect-text "${url}"`, { encoding: 'utf-8' })
		} catch (e) {
			if (
				e
					?.toString()
					.includes(
						"We're not allowed to access the URL on your behalf. Please download the content and pass it in.",
					)
			) {
				// Retry with downloaded content.
				const file = await (await fetch(url)).arrayBuffer()
				const id = Math.random().toString(16).slice(2)
				const filepath = './.tmp/' + id

				try {
					await Bun.write(filepath, file, { createPath: true })

					resultText = execSync(`gcloud ml vision detect-text "${filepath}"`, { encoding: 'utf-8' })
				} finally {
					fs.rmSync(filepath)
				}
			} else {
				throw e
			}
		}

		const result: RootObject = JSON.parse(resultText)
		const text = result?.responses?.at(0)?.fullTextAnnotation?.text

		if (!text) {
			console.warn('⚠️ No text extracted from', url)
		}

		return text || ''
	}
}
