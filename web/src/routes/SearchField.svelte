<script lang="ts">
	import { type } from '$lib/ui/animations/type'
	import { createDebounce } from '$lib/utils'
	import { fade } from 'svelte/transition'
	import Loader from './Loader.svelte'

	export let search: (text: string) => any
	export let loading = false

	let value = ''

	const debouncedSearch = createDebounce(500, search)

	$: trimmed = value.trim()
	$: debouncedSearch(trimmed)

	const placeholders = [
		'Wie wasche ich richtig?',
		'Welcher Waschgang?',
		'Wahl in den USA...',
		'Wie funktioniert ein Kühlschrank?',
		'Schnell Geld verdienen...',
		'Gesunde Ernährung...',
		'Home-Workouts...',
		'Nachhaltiges Reisen...',
		'Aktuelle Entwicklungen in der Raumfahrt...',
		'Methoden zur Stressbewältigung...',
		'Gärtnern auf dem Balkon...',
		'Wie repariere ich mein Fahrrad?',
		'Erfolgreiches Vorstellungsgespräch...',
		'Umweltfreundlich im Alltag...',
		'Neue Techniktrends...',
		'Wie trenne ich richtig Müll?',
	]
</script>

<div class="mx-3 mb-8 sticky top-1 z-50 text-center">
	<div class="container relative w-[min(100%,20rem)] m-auto rounded-xl shadow-2xl">
		{#if !value}
			<div
				transition:fade={{ duration: 200 }}
				class="placeholder px-4 py-2 absolute inset-0 grid items-center justify-start pointer-events-none opacity-90"
			>
				<div
					class="h-fit w-fit max-w-full overflow-hidden whitespace-nowrap overflow-ellipsis inline-flex items-center"
				>
					<span class="whitespace-pre" use:type={{ strings: placeholders, delay: 200 }}></span><span
						class="cursor">|</span
					>
				</div>
			</div>
		{/if}

		{#if loading}
			<div
				class="absolute inset-0 right-4 grid items-center justify-end text-xs z-50 pointer-events-none"
			>
				<Loader />
			</div>
		{/if}

		<input
			autocomplete="off"
			id="search-field"
			class="w-full text-xl px-4 py-2 rounded-xl pointer-events-auto"
			bind:value
		/>
	</div>
</div>

<style lang="scss">
	@use 'sass:color';
	@import '../styles/vars.scss';

	$color-1: $color-accent-1;
	$color-2: $color-accent-2;
	$tw-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
		var(--tw-shadow);

	.container {
		position: relative;
		pointer-events: none;

		$alpha: 0.5;
		background: linear-gradient(
			24deg,
			color.change($color-1, $alpha: $alpha) 0%,
			color.change($color-2, $alpha: $alpha) 60%,
			color.change($color-2, $alpha: $alpha) 71%,
			color.change($color-1, $alpha: $alpha) 100%
		);

		backdrop-filter: blur(4px);

		// from https://dev.to/afif/border-with-gradient-and-radius-387f
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			padding: 3px;

			background: linear-gradient(
				24deg,
				var(--color-accent-1) 0%,
				var(--color-accent-2) 60%,
				var(--color-accent-2) 71%,
				var(--color-accent-1) 100%
			);

			mask:
				linear-gradient(#fff 0 0) content-box,
				linear-gradient(#fff 0 0);
			mask-composite: exclude;
		}

		transition: scale 500ms ease;

		&:focus-within {
			scale: 1.05;
		}
	}

	input {
		font-size: 1rem;
		width: min(100%, 20em);

		color: white !important;
		background: transparent;

		box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.5);
	}

	.cursor {
		display: inline-block;
		animation: blink 1s infinite;
		margin-left: 2px;
		width: 2px;
		height: 1em;
		color: transparent;
		background: white;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}

		50% {
			opacity: 0;
		}
	}
</style>
