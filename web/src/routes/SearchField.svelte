<script lang="ts">
	import { createDebounce } from '$lib/utils'

	export let search: (text: string) => any
	export let highlighted: boolean = true

	let value = ''

	const debouncedSearch = createDebounce(500, search)

	$: debouncedSearch(value)
</script>

<label>
	<div class="label-text">Nach was suchst Du?</div>
	<input
		class="sticky top-1 text-xl p-2 rounded-xl shadow-2xl border-[2px] border-fuchsia-700"
		bind:value
		class:highlighted
		placeholder="Waschmaschine..."
	/>
</label>

<style lang="scss">
	.label-text {
		margin-bottom: 0.25rem;
	}

	input {
		width: min(100%, 20em);
		// border: 1px solid #ccc;
		// border-radius: 12px;
		// padding: 1rem;
		// transition: all 300ms ease;
		// background-color: var(--surface-1);
		// color: white;
		&.highlighted {
			// scale: 2;
			// translate: 0 200%;
		}
	}
</style>
