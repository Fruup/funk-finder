import { getPocketbase } from './helpers/config'
import type { Db } from '@funk-finder/db'
import { get_encoding } from 'tiktoken'
import './helpers/shims'

const pb = getPocketbase()
const enc = get_encoding('cl100k_base')

const getNumberOfTokens = (text: string) => enc.encode(text).length

const media = await pb.collection<Db.Medium>('media').getFullList({
	filter: 'text != null',
})

const posts = await pb.collection<Db.Post>('posts').getFullList({
	filter: 'caption != null',
})

console.info(`🔍 Counting tokens for ${posts.length} posts and ${media.length} media...`)

const numMediaTokens = media.reduce((tokens, { text }) => tokens + getNumberOfTokens(text!), 0)
const numPostTokens = posts.reduce((tokens, { caption }) => tokens + getNumberOfTokens(caption!), 0)

console.info('📊 Results are in:')
console.table({
	posts: {
		'# items': posts.length,
		'# tokens': numPostTokens,
		'⌀ tokens/item': numPostTokens / posts.length,
	},
	media: {
		'# items': media.length,
		'# tokens': numMediaTokens,
		'⌀ tokens/item': numMediaTokens / media.length,
	},
	// total
	total: {
		'# items': posts.length + media.length,
		'# tokens': numPostTokens + numMediaTokens,
		'⌀ tokens/item': (numPostTokens + numMediaTokens) / (posts.length + media.length),
	},
})

enc.free()
