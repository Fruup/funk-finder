<script lang="ts">
	import { createDebounce } from '$lib/utils'

	export let search: (text: string) => any
	export let highlighted: boolean = true

	let value = ''

	const debouncedSearch = createDebounce(500, search)

	$: debouncedSearch(value)
</script>

<input bind:value class:highlighted />

<style lang="scss">
	input {
		font-size: 2rem;
		border: 1px solid #ccc;
		border-radius: 12px;
		padding: 1rem;

		transition: all 300ms ease;

		&.highlighted {
			scale: 2;
			translate: 0 200%;
		}
	}
</style>
