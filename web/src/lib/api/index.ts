import { error } from '@sveltejs/kit'
import { Api, type App } from '$lib/types'

const CLIENT_ID = '1598118050649715'
const CLIENT_SECRET = '2e80350272eb55ae36a35016e44b0700'
const REDIRECT_URI = 'https://localhost:5173/auth/'

let token: string | null = null

const throwFetchResponse = async (response: Response): Promise<never> => {
	throw error(response.status as any, {
		message: JSON.stringify(await response.json()),
	})
}

export default {
	async getAccessToken(authorizationCode: string): Promise<string> {
		const data = new FormData()
		data.set('client_id', CLIENT_ID)
		data.set('client_secret', CLIENT_SECRET)
		data.set('grant_type', 'authorization_code')
		data.set('redirect_uri', REDIRECT_URI)
		data.set('code', authorizationCode)

		const response = await fetch('https://api.instagram.com/oauth/access_token', {
			method: 'POST',
			body: data,
		})

		if (response.status === 200) {
			const { access_token }: { access_token: string; user_id: string } = await response.json()

			return access_token
		} else {
			throw error(response.status as any, { message: JSON.stringify(await response.json()) })
		}
	},

	getAuthorizationUrl() {
		return `https://api.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`
	},

	async getPosts(): Promise<App.Post[]> {
		if (!token) throw Error(`Token not set!`)

		const response = await fetch(
			`https://graph.instagram.com/me/media?access_token=${token}&fields=caption,media_url,media_type`,
		)

		if (response.status === 200) {
			const { data }: { data: Api.Medium[]; page: any } = await response.json()

			const posts = await Promise.all(
				data
					.filter(({ media_type }) => Api.isMediaType(media_type))
					.map(async (medium): Promise<App.Post> => {
						let media: App.Post['media'] = []

						if (medium.media_type === 'IMAGE') {
							media = [{ id: medium.id, url: medium.media_url }]
						} else if (medium.media_type === 'CAROUSEL_ALBUM') {
							const response = await fetch(
								`https://graph.instagram.com/${medium.id}/children?access_token=${token}&fields=media_url,media_type`,
							)

							const body: { data: Api.Medium[] } = await response.json()

							media = body.data
								.filter((medium) => medium.media_type === 'IMAGE')
								.map((medium) => ({
									id: medium.id,
									url: medium.media_url,
								}))
						}

						return {
							id: medium.id,
							caption: medium.caption,
							media,
						}
					}),
			)

			return posts
		}

		throw throwFetchResponse(response)

		// return [
		// 	{
		// 		id: 1,
		// 		url: 'https://cdn.sanity.io/images/sg4gqb2a/production/dcf7312e5c69dcf3c0012f3474efb2381e392844-146x146.gif?w=256&h=256',
		// 	},
		// ]
	},

	storeAccessToken(token_: string) {
		token = token_
	},
}
