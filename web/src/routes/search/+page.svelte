<script lang="ts">
	import { onMount } from 'svelte'
	import SearchBox from './SearchBox.svelte'
	import { flip } from 'svelte/animate'
	import { fly } from 'svelte/transition'

	export let data
	const { posts } = data

	let ids: string[] = []
	let _posts: Awaited<typeof posts> = []

	onMount(() => {
		posts.then((posts) => {
			_posts = posts
		})
	})

	$: filteredPosts = _posts.filter((post) => ids.includes(post.id))
</script>

<h1>Search posts</h1>

{#await posts}
	Loading posts...
{:then posts}
	Posts loaded!

	<SearchBox {posts} bind:ids />

	<ul>
		{#each filteredPosts as post, i (post.id)}
			{@const firstMedium = post.media?.[0]}

			<li
				in:fly={{ delay: i * 50, duration: 250, y: 10 }}
				out:fly={{ delay: 0, duration: 100 }}
				animate:flip={{ duration: 250 }}
			>
				{#if firstMedium}
					<a href={post.url}>
						<img src={firstMedium.url} alt={firstMedium.text} />
					</a>

					{post.caption}
				{/if}
			</li>
		{/each}
	</ul>
{:catch error}
	Error!
	{error}
{/await}

<style>
	img {
		width: 100%;
		height: auto;
		object-fit: cover;
		aspect-ratio: 1;
	}

	ul {
		margin: auto;
		max-width: 1000px;
		display: flex;
		flex-wrap: wrap;

		gap: 0.25rem;
	}

	li {
		list-style: none;

		max-width: 312px;

		display: flex;
		flex-direction: column;
	}
</style>
