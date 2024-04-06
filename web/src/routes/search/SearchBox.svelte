<script lang="ts">
	import { onMount } from 'svelte'
	import type * as Db from '@funk-finder/db/types/models'
	import type TFuse from 'fuse.js'

	export let posts: Db.Post[]
	export let ids: string[] = posts.map((post) => post.id)
	export let loading = true

	let value = ''
	let timer: ReturnType<typeof setTimeout>
	let fuse: TFuse<any>

	function search() {
		loading = true

		// TODO
		const result = fuse.search(value)
		console.log(result)
		ids = result.map(({ item }) => item.id)

		loading = false
	}

	$: if (value) {
		clearTimeout(timer)
		timer = setTimeout(() => {
			search()
		}, 500)
	} else {
		ids = posts.map((post) => post.id)
		// reset
	}

	onMount(() => {
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
		import('fuse.js')
			.then((module) => new module.default(posts, { keys: ['caption', 'media.text'] }))
			.then((_fuse) => {
				fuse = _fuse
				loading = false
			})
	})
</script>

{#if loading}
	Loading...
{:else}
	<input type="search" name="search" id="search" placeholder="Search..." bind:value />
{/if}
