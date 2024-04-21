<script lang="ts">
	import api from '$lib/api'
	import type { SearchResponseItem } from '$lib/types'
	import { flip } from 'svelte/animate'
	import SearchField from './SearchField.svelte'
	import { scale } from 'svelte/transition'
	import DebugContainer from './DebugContainer.svelte'

	let loading = false
	let items: SearchResponseItem[] = []

	const duration = 150

	const search = async (text: string) => {
		if (text.length < 3) return

		loading = true

		try {
			items = await api.search(text)
		} catch (e) {
			console.error(e)

			items = []
		}

		loading = false
	}

	const getProxyPath = (path: string) => {
		const params = new URLSearchParams({ q: path })
		return `/api/v1/proxy?${params}`
	}
</script>

<div class="page">
	<SearchField highlighted={items.length === 0} {search} />

	<ul>
		{#each items as item, i (item.id)}
			{@const delay = 100 * i}

			<li
				animate:flip={{ delay: duration, duration: 3 * duration }}
				in:scale={{ delay: duration + delay, start: 1.05, duration: 2 * duration }}
				out:scale={{ duration, start: 0.9 }}
			>
				<a
					href="https://instagram.com/p/{item.shortcode}"
					target="_blank"
					rel="nofollow noreferrer"
				>
					<img src={getProxyPath(item.imageUrl)} alt={item.text} crossorigin="anonymous" />
				</a>
			</li>
		{/each}
	</ul>
</div>

<p>💡 Haven't found what you are looking for? Specify your query further to narrow it down!</p>

<!-- <DebugContainer>{foo}</DebugContainer> -->

<style lang="scss">
	.page {
		text-align: center;
	}

	ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 4px;
		grid-template-columns: 1fr 1fr 1fr;
		max-width: 1000px;

		margin: 2rem auto;
	}

	li {
		width: 100%;
		height: auto;
		aspect-ratio: 1;

		:global(*) {
			display: block;
			width: 100%;
			height: 100%;
		}
	}

	img {
		object-fit: cover;
		object-position: center;
	}
</style>
