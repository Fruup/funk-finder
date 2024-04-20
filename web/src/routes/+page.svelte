<script lang="ts">
	import api from '$lib/api'
	import type { SearchResponseItem } from '$lib/types'
	import { flip } from 'svelte/animate'
	import SearchField from './SearchField.svelte'

	let foo = $state('')
	let loading = $state(false)
	let items: SearchResponseItem[] = $state([])

	const search = async (text: string) => {
		if (text.length < 3) return

		loading = true

		try {
			items = await api.search(text)
			foo = JSON.stringify(items, null, 2)
		} catch (e) {
			console.error(e)

			items = []
			if (e) foo = e.toString()
		}

		loading = false
	}
</script>

<div style="text-align: center;">
	<SearchField {loading} highlighted={items.length === 0} {search} />
</div>

<ul>
	{#each items as item, i (item.id)}
		<li animate:flip={{ delay: 10 * i, duration: 200 }}>
			{#if item.type === 'medium'}
				<img src={item.imageUrl} alt={item.text} />
			{:else}
				<a href="https://instagram.com/p/{item.shortcode}">post</a>
			{/if}
		</li>
	{/each}
</ul>

<pre><code>{foo}</code></pre>

<style lang="scss">
	ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 0.5rem;
		grid-template-columns: 1fr 1fr 1fr;
	}

	pre {
		background: #f4f4f4;
		padding: 1rem;
		overflow: auto;
	}

	img {
		width: 100%;
		height: auto;
	}
</style>
