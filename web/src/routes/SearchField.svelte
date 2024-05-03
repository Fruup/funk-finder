<script lang="ts">
	import { createDebounce } from '$lib/utils'
	import type { Action } from 'svelte/action'
	import { fade } from 'svelte/transition'

	export let search: (text: string) => any
	export let highlighted: boolean = true

	let value = ''

	const debouncedSearch = createDebounce(500, search)

	$: debouncedSearch(value)

	const placeholders = [
		'Wie wasche ich richtig?',
		'Wahl in den USA...',
		'Wie funktioniert ein Kühlschrank?',
		'Schnell Geld verdienen...',
	]

	const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)]

	const type: Action<HTMLElement, { strings: string[] }> = (node, options) => {
		let currentIndex = 0
		let string = options.strings[currentIndex]
		let i = 0
		let interval: ReturnType<typeof setInterval>

		const next = () => {
			currentIndex = (currentIndex + 1) % options.strings.length
			string = options.strings[currentIndex]
			i = 0
		}

		const clear = () => {
			interval = setInterval(() => {
				if (node.innerText.length > 0) {
					node.innerText = node.innerText.slice(0, -1)
				} else {
					clearInterval(interval)
					next()
					start()
				}
			}, 50)
		}

		const start = () => {
			node.innerText = ''

			interval = setInterval(() => {
				if (i >= string.length) {
					clearInterval(interval)
					setTimeout(() => {
						clear()
					}, 5000)
					return
				}

				node.innerText += string[i]
				i++
			}, 100)
		}

		start()

		return {
			destroy() {
				clearInterval(interval)
			},
		}
	}
</script>

<label>
	<!-- <div class="label-text">Nach was suchst Du?</div> -->

	<div class="mx-1 mb-8 sticky top-1 z-50">
		<!-- {#if !value}
			<div out:fade={{ duration: 200 }} class="placeholder absolute inset-y-0">
				<span use:type={{ strings: placeholders }}></span><span class="cursor">|</span>
			</div>
		{/if} -->

		<input
			class="text-xl px-4 py-2 rounded-xl shadow-2xl border-[2px] border-fuchsia-700"
			bind:value
			class:highlighted
			{placeholder}
		/>
	</div>
</label>

<style lang="scss">
	.label-text {
		margin-bottom: 0.25rem;
	}

	input {
		position: -webkit-sticky;

		font-size: 1rem;
		width: min(100%, 20em);

		$c0: rgb(203, 0, 255);
		$c1: rgb(255, 128, 0);
		// $c1: rgba(255, 177, 46, 1);

		border: 2px solid white;

		background: $c0;
		background: linear-gradient(24deg, $c0 0%, $c1 60%, $c1 71%, $c0 100%);

		color: white !important;

		transition: scale 500ms ease;

		&:focus {
			scale: 1.05;
		}
	}

	.placeholder {
		pointer-events: none;
		opacity: 0.7;
	}

	.cursor {
		animation: blink 1s infinite;
		width: 2px;
		height: 1lh;
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
