<script lang="ts">
	import api from '$lib/api'
	import type { SearchResponseItem } from '$lib/types'
	import { flip } from 'svelte/animate'
	import SearchField from './SearchField.svelte'
	import { blur, scale } from 'svelte/transition'
	import DebugContainer from './DebugContainer.svelte'
	import { onMount } from 'svelte'
	import Image from './Image.svelte'
	import Drawer from '$lib/ui/Drawer.svelte'
	import Loader from './Loader.svelte'
	import Box from '$lib/ui/Box.svelte'
	import analytics from '$lib/analytics'
	import Page from './Page.svelte'

	let loading = false
	let items: SearchResponseItem[] = []

	let isDrawerOpen = false
	let drawerText = ''

	const duration = 150
	let unsubscribe: () => void
	const queue: string[] = []

	const search = async (text: string) => {
		if (text.length < 3) return

		// Prevent multiple searches simultaneously.
		if (loading) {
			queue.push(text)
			return
		}

		loading = true

		try {
			unsubscribe?.()

			// Track search event.
			analytics.event('search', { query: text })

			// Send query.
			const store = await api.search(text)
			unsubscribe = store.subscribe((value) => {
				items = value
			})
		} catch (e) {
			console.error(e)

			items = []
		}

		loading = false

		if (queue.length > 0) {
			search(queue.shift()!)
		}
	}

	function handleClickPost(e: Event, item: SearchResponseItem) {
		if (isDrawerOpen) {
			e.preventDefault()
			return
		}

		analytics.event('clickItem', { item, id: item.id, shortcode: item.shortcode })
	}

	onMount(() => {
		return () => {
			unsubscribe?.()
		}
	})

	function focus() {
		const searchField = document.querySelector<HTMLInputElement>('input#search-field')
		if (!searchField) return

		searchField.focus({ preventScroll: true })

		window.scrollTo({
			top: searchField.getBoundingClientRect().top + window.scrollY - 100,
			behavior: 'smooth',
		})
	}
</script>

<Drawer bind:open={isDrawerOpen}>
	<p>
		{drawerText}
	</p>
</Drawer>

<Page noMargin>
	<SearchField {search} {loading} />

	<ul class="m-auto max-w-screen-md grid grid-cols-3 gap-[1px]">
		{#each items as item, i (item.id)}
			{@const delay = 100 * i}

			<li
				class="aspect-square shadow-md"
				animate:flip={{ delay: duration, duration: 3 * duration }}
				in:scale={{ delay: duration + delay, start: 1.05, duration: 2 * duration }}
				out:scale={{ duration, start: 0.9 }}
			>
				<a
					class="block size-full"
					href="https://instagram.com/p/{item.shortcode}"
					target="_blank"
					rel="nofollow noreferrer"
					on:click={(e) => handleClickPost(e, item)}
				>
					<Image {item} />
				</a>
			</li>
		{/each}
	</ul>

	{#if loading}
		<div in:blur={{ delay: 200 }} class="text-2xl p-8">
			<Loader />
		</div>
	{:else if items.length === 0}
		<!-- <div in:blur={{ delay: 200 }} out:blur={{ duration: 200 }}>
			<Box onClick={focus}>
				<span slot="icon">✏️</span>
				Gib eine Suchanfrage mit &gt;2 Zeichen ein!
			</Box>
		</div> -->
	{/if}
</Page>

{#if items.length > 0}
	<Box onClick={focus}>
		<span slot="icon">💡</span>

		Nicht gefunden, was Du suchst?

		<p slot="content">Verfeinere Deine Suche, um bessere Ergebnisse zu erhalten!</p>
	</Box>
{/if}

<!-- <DebugContainer>{JSON.stringify(items, null, 2)}</DebugContainer> -->
