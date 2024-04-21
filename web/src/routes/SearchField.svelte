<script lang="ts">
	import { createDebounce } from '$lib/utils'

	export let search: (text: string) => any
	export let highlighted: boolean = true

	let value = ''

	const debouncedSearch = createDebounce(500, search)

	$: debouncedSearch(value)
</script>

<label>
	<div class="label-text">bloibla</div>
	<input bind:value class:highlighted />
</label>

<style lang="scss">
	.label-text {
		margin-bottom: 0.25rem;
	}

	input {
		font-size: 2rem;
		border: 1px solid #ccc;
		border-radius: 12px;
		padding: 1rem;

		transition: all 300ms ease;

		background-color: var(--surface-1);
		color: white;

		&.highlighted {
			scale: 2;
			translate: 0 200%;
		}
	}
</style>
