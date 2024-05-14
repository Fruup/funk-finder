<script lang="ts">
	import type { SearchResponseItem } from '$lib/types'
	import { fade } from 'svelte/transition'
	import Loader from './Loader.svelte'

	export let item: SearchResponseItem
	let loading = true

	const getProxyPath = (path: string) => {
		const params = new URLSearchParams({ q: path })
		return `/api/v1/proxy?${params}`
	}
</script>

<div class="image-container" class:loading>
	{#if loading}
		<div transition:fade={{ duration: 200 }} class="loading-container">
			<Loader />
		</div>
	{/if}

	<img
		class="object-cover object-top w-full h-full"
		src={getProxyPath(item.imageUrl)}
		alt={item.text}
		crossorigin="anonymous"
		on:load={() => (loading = false)}
		on:error={() => (loading = true)}
	/>
</div>

<style lang="scss">
	@use 'sass:list';
	@use 'sass:math';
	@use 'sass:color';
	@import '../styles/vars.scss';

	img {
		transition: all 200ms ease;
	}

	.image-container {
		position: relative;
		width: 100%;
		height: 100%;

		background-color: var(--surface-1);

		&.loading {
			img {
				visibility: hidden;
				opacity: 0;
				scale: 0.9;
			}
		}
	}

	.loading-container {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		font-size: 1.5rem;

		background-image: radial-gradient(
			circle at center,
			gradient($c0: transparent, $c1: color.change(white, $alpha: 0.2))
		);
	}
</style>
