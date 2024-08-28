import { json } from '@sveltejs/kit'
import pkg from '../../../package.json'
import * as env from '$env/static/private'

export const prerender = true

export const GET = async () => {
	return json({
		Name: pkg.name,
		Version: pkg.version,
		BuildTime: new Date().toISOString(),
		// @ts-expect-error - SOURCE_COMMIT is a Coolify environment variable
		Commit: env.SOURCE_COMMIT ?? '',
	})
}
