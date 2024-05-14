<script lang="ts">
	import '../styles/global.scss'
	import '../app.css'
	import { blur } from 'svelte/transition'
	import backgroundImageUrl from '../assets/image.png?lossless&format=webp&imagetools'

	const css = `
		:root {
			--background-image-url: url("${backgroundImageUrl}");
		}`
</script>

<svelte:head>
	{@html `<${''}style>${css}</style>`}
</svelte:head>

<header class="flex flex-col gap-2 h-[45vh] justify-center items-center">
	<h1 class="text-4xl text-center">
		<a href="/">
			FUNK<br />FINDER
		</a>
	</h1>
	<p transition:blur={{}} class="text-sm text-center">
		{#if true}
			Finde den <a
				class="gradient-text"
				href="https://instagram.com/funk"
				target="_blank"
				rel="noreferrer nofollow">@funk</a
			>
			Post,<br />
			den Du schon seit Ewigkeiten suchst 🔍
		{/if}

		{#if false}
			Durchsuche
			<a href="https://instagram.com/funk" target="_blank" rel="noreferrer nofollow"> @funk </a>
			Posts
			<br />
			nach einem beliebigen Thema 🔍
		{/if}
	</p>
</header>

<slot />

<style lang="scss">
	@use 'sass:list';
	@use 'sass:math';
	@use 'sass:color';
	@import '../styles/vars.scss';

	p {
		color: var(--text-1);
	}

	h1,
	p {
		filter: drop-shadow(0 0 6px var(--surface-0));
	}

	:global(body) {
		min-height: 100vh;
		position: relative;
		overflow-y: visible;

		&::before {
			position: absolute;
			content: '';
			inset: 0;
			height: 100vh;
			z-index: -1000;

			background-image: var(--background-image-url);
			background-size: cover;
			background-position-x: 60%;

			mask: linear-gradient(135deg, gradient(white, transparent)),
				linear-gradient(to bottom, white, transparent);
			mask-composite: subtract;

			scale: 1 -1;
		}
	}
</style>
