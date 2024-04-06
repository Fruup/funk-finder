import api from '$lib/api/index'
import { redirect } from '@sveltejs/kit'

export const load = async ({ url }) => {
	const authorizationCode = url.searchParams.get('code')

	if (authorizationCode) {
		// Exchange for an access token.
		const token = await api.getAccessToken(authorizationCode)
		api.storeAccessToken(token)

		// Send to home page.
		throw redirect(301, `/upload?toast=authorization_success&token=${token}`)
	}
}
