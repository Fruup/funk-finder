<script lang="ts">
	import { createDebounce } from '$lib/utils'

	let {
		search,
		loading = false,
		highlighted = true,
	}: {
		search: (text: string) => void
		loading: boolean
		highlighted: boolean
	} = $props()

	let value = $state('')

	const debouncedSearch = createDebounce(500, search)

	$effect(() => {
		debouncedSearch(value)
	})
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
