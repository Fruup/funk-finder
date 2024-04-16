<script lang="ts">
	import { onMount } from 'svelte'
	import type * as Db from '@funk-finder/db/types/models'
	import type TFuse from 'fuse.js'
	import { fly } from 'svelte/transition'
	import { flip } from 'svelte/animate'

	// export let posts: Db.Post[]
	// export let ids: string[] = posts.map((post) => post.id)
	export let loading = true

	let value = ''
	let timer: ReturnType<typeof setTimeout>
	let fuse: TFuse<any>

	let media: {
		Text: string
		Distance: number
		Url: string
	}[] = []

	async function search() {
		loading = true

		// TODO
		// const result = fuse.search(value)
		// console.log(result)
		// ids = result.map(({ item }) => item.id)

		const response = await fetch(encodeURI('http://localhost:8090/search?q=' + value))
		const body: typeof media = await response.json()
		media = body

		loading = false
	}

	$: if (value) {
		clearTimeout(timer)
		timer = setTimeout(() => {
			search()
		}, 500)
	} else {
		// ids = posts.map((post) => post.id)
		// reset
	}

	onMount(async () => {
		// const items = posts.flatMap(
		// 	(post) =>
		// 		post.media?.map((medium) => ({
		// 			...medium,
		// 			mediumId: medium.id,
		// 			postId: post.id,
		// 			// caption: post.caption,
		// 		})) ?? [],
		// )

		// Load search library.
		loading = true
		// const { default: Fuse } = await import('fuse.js')

		// Fuse.parseIndex(serializedIndex)
		// const index = undefined

		// fuse = new Fuse(posts, { keys: ['caption', 'media.text'] }, index)
		loading = false
	})
</script>

{#if loading}
	Loading...
{:else}
	<input type="search" name="search" id="search" placeholder="Search..." bind:value />

	<ul>
		{#each media as { Distance, Text, Url }, i (Url)}
			<li
				in:fly={{ delay: i * 50, duration: 250, y: 10 }}
				out:fly={{ delay: 0, duration: 100 }}
				animate:flip={{ duration: 250 }}
			>
				<a href={Url}>
					<img src={Url} alt={Text} />
				</a>

				{Distance}
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		list-style: none;
	}

	li {
		list-style: none;
		max-width: 150px;
	}

	img {
		width: 100%;
	}
</style>
