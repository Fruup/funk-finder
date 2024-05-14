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
	]
</script>

<div class="mx-3 mb-8 top-1 z-50 text-center">
	<div class="relative w-[min(100%,20rem)] m-auto">
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
			class="w-full text-xl px-4 py-2 rounded-xl shadow-2xl pointer-events-auto"
			bind:value
		/>
	</div>
</div>

<style lang="scss">
	input {
		font-size: 1rem;
		width: min(100%, 20em);

		outline: 2px solid var(--color-accent-2);
		background: linear-gradient(
			24deg,
			var(--color-accent-1) 0%,
			var(--color-accent-2) 60%,
			var(--color-accent-2) 71%,
			var(--color-accent-1) 100%
		);
		color: white !important;

		box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.5);

		transition: scale 500ms ease;

		&:focus {
			scale: 1.05;
		}
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
