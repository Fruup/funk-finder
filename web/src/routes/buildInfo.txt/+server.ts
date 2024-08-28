import { json } from '@sveltejs/kit'
import pkg from '../../../package.json'
import * as env from '$env/static/private'

export const prerender = true

export const GET = async () => {
	return json({
		Name: pkg.name,
		Version: pkg.version,
		BuildTime: new Date().toISOString(),
		Commit: env.SOURCE_COMMIT ?? '',
	})
}
