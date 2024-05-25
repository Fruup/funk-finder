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
		const resultText = execSync(`gcloud ml vision detect-text "${url}"`, { encoding: 'utf-8' })
		const result: RootObject = JSON.parse(resultText)
		const text = result.responses.at(0)?.fullTextAnnotation.text

		if (!text) {
			console.warn('⚠️ No text extracted from', url)
		}

		return text || ''
	}
}
