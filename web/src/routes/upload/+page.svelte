<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import api from '$lib/api'
	import db from '$lib/db'

	let toast = ''

	const token = $page.url.searchParams.get('token')

	if (token) {
		api.storeAccessToken(token)
	}

	if (browser && $page.url.searchParams.get('toast') === 'authorization_success') {
		toast = 'Authorization was successful!'
	}

	let posts = api.getPosts()

	posts.then((posts) => {
		db.setPosts(posts)
	})
</script>

{#if toast}
	{toast}
{/if}

{#await posts}
	Loading...
{:then posts}
	<ul>
		{#each posts as { id, media }}
			{#each media as { url }}
				<li>
					<!-- {id}: <img src={url} /> -->
					<a href={url}>{url}</a>
				</li>
			{/each}
		{/each}
	</ul>
{/await}

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
