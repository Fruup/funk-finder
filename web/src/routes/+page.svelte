<script lang="ts">
	import api from '$lib/api'
	import type { SearchResponseItem } from '$lib/types'
	import { flip } from 'svelte/animate'
	import SearchField from './SearchField.svelte'
	import { scale } from 'svelte/transition'
	import DebugContainer from './DebugContainer.svelte'
	import { onMount } from 'svelte'
	import Image from './Image.svelte'

	let loading = false
	let items: SearchResponseItem[] = []

	const duration = 150
	let unsubscribe: () => void

	const search = async (text: string) => {
		if (text.length < 3) return

		loading = true

		try {
			unsubscribe?.()

			const store = await api.search(text)

			unsubscribe = store.subscribe((value) => {
				items = value
			})
		} catch (e) {
			console.error(e)

			items = []
		}

		loading = false
	}

	onMount(() => {
		return () => {
			unsubscribe?.()
		}
	})
</script>

<div class="page">
	<SearchField highlighted={items.length === 0} {search} />

	<ul class="m-auto max-w-screen-md grid grid-cols-3 gap-1">
		{#each items as item, i (item.id)}
			{@const delay = 100 * i}

			<li
				class="aspect-square"
				animate:flip={{ delay: duration, duration: 3 * duration }}
				in:scale={{ delay: duration + delay, start: 1.05, duration: 2 * duration }}
				out:scale={{ duration, start: 0.9 }}
			>
				<a
					class="block w-full h-full"
					href="https://instagram.com/p/{item.shortcode}"
					target="_blank"
					rel="nofollow noreferrer"
				>
					<Image {item} />
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
</style>
