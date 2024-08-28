<script lang="ts">
	import { fly } from 'svelte/transition'

	export let noMargin = false

	const duration = 300
	const y = 20
</script>

<div
	class={noMargin ? '' : 'mx-6'}
	in:fly={{ duration, delay: duration, y }}
	out:fly={{ duration, y }}
>
	<div class="m-auto max-w-[600px]">
		<slot />
	</div>
</div>
