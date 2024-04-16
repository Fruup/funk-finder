import { error } from '@sveltejs/kit'
import { Api, type App } from '$lib/types'
import Pocketbase from 'pocketbase'

let pb: Pocketbase

const throwFetchResponse = async (response: Response): Promise<never> => {
	throw error(response.status as any, {
		message: JSON.stringify(await response.json()),
	})
}

export default {
	async initialize() {
		pb = new Pocketbase('http://localhost:8080')
	},

	async getPosts(): Promise<App.Post[]> {
		// throw throwFetchResponse(response)
	},
}
