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

<!-- <Drawer>
	<p>
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, aut? Laboriosam, non
		sapiente debitis corrupti molestiae magnam quo! Deleniti magni ratione ipsam consectetur, nobis
		nesciunt incidunt saepe facere expedita quidem.
	</p>
</Drawer> -->

<div class="page">
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

	{#if loading}
		<div in:blur={{ delay: 200 }} class="text-2xl p-8">
			<Loader />
		</div>
	{:else if items.length === 0}
		<div in:blur={{ delay: 200 }} out:blur={{ duration: 200 }}>
			<Box onClick={focus}>
				<span slot="icon">✏️</span>
				Gib eine Suchanfrage mit &gt;2 Zeichen ein!
			</Box>
		</div>
	{/if}
</div>

{#if items.length > 0}
	<Box onClick={focus}>
		<span slot="icon">💡</span>

		Nicht gefunden, was Du suchst?

		<p slot="content">Verfeinere Deine Suche, um bessere Ergebnisse zu erhalten!</p>
	</Box>
{/if}

<!-- <p>💡 Haven't found what you are looking for? Specify your query further to narrow it down!</p> -->

<!-- <DebugContainer>{JSON.stringify(items, null, 2)}</DebugContainer> -->

<style lang="scss">
	.page {
		text-align: center;
	}
</style>
