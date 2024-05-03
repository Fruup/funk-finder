<script lang="ts">
	import { Drawer } from 'vaul-svelte'

	export let open = true
</script>

<Drawer.Root preventScroll={false} bind:open>
	<Drawer.Portal class="fixed  bottom-0 w-full">
		<!-- <Drawer.Overlay /> -->
		<Drawer.Content class="flex flex-col p-8 rounded-t-[12px] max-w-[500px] m-auto shadow-xl">
			<div class="handle h-1 w-6 mb-1 bg-black rounded-full" />
			<slot />
		</Drawer.Content>
		<Drawer.Overlay />
	</Drawer.Portal>
</Drawer.Root>
