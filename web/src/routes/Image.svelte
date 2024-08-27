<script lang="ts">
	import type { SearchResponseItem } from '$lib/types'
	import { Image } from 'lucide-svelte'

	export let item: SearchResponseItem
	let loading = true

	const getProxyPath = (path: string) => {
		const params = new URLSearchParams({ q: path })
		return `/api/v1/proxy?${params}`
	}
</script>

<div class="image-container" class:loading>
	{#if loading}
		<div class="p-4 py-3 size-full text-left drop-shadow-lg">
			<p class="line-clamp-[7]">
				<Image class="inline" />
				{item.text}
			</p>
		</div>
	{/if}

	<img
		class="object-cover object-top size-full"
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

		background: $color-accent-1;
		background: linear-gradient(
				153deg,
				color.adjust($color-accent-1, $alpha: -0.2) 0%,
				rgba(254, 73, 73, 0.8) 50%,
				color.adjust($color-accent-2, $alpha: -0.2) 100%
			),
			radial-gradient(
				circle at center,
				gradient($c0: transparent, $c1: color.change(black, $alpha: 0.2))
			);
		background-blend-mode: overlay;

		&.loading {
			img {
				visibility: hidden;
				opacity: 0;
				scale: 0.9;
			}
		}
	}
</style>
