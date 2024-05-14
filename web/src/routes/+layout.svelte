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
	<h1 class="text-4xl text-center">FUNK<br />FINDER</h1>
	<p transition:blur={{}} class="text-sm text-center">
		{#if true}
			Finde den <a href="https://instagram.com/funk" target="_blank" rel="noreferrer nofollow"
				>@funk</a
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

	p {
		color: var(--text-1);
	}

	h1,
	p {
		filter: drop-shadow(0 0 6px var(--surface-0));
	}

	a {
		position: relative;
		background-clip: text;

		color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
		background-image: linear-gradient(90deg, var(--color-accent-2), var(--color-accent-1));
	}

	@function easeInOutCubic($x) {
		@if $x < 0.5 {
			@return calc(4 * $x * $x * $x);
		}
		@if $x >= 0.5 {
			@return calc(1 - math.pow(-2 * $x + 2, 3) / 2);
		}
	}

	@function gradient($c0, $c1, $n: 5) {
		$list: ();

		@for $i from 0 through $n {
			$t: calc($i / $n);
			// $p: calc(100% * math.pow(math.$e, -10 * $t * $t));
			$p: calc(100% * easeInOutCubic($t));
			$color: color.mix($c0, $c1, $p) $p;
			$list: list.append($list, $color, $separator: comma);
		}

		// background: radial-gradient(circle at center, $list);
		@return $list;
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
