<script lang="ts">
	export let onClick: (() => void) | undefined = undefined
</script>

<div class="margin-container mx-3">
	<svelte:element
		this={onClick ? 'button' : 'div'}
		role={onClick && 'button'}
		type={onClick && 'button'}
		on:click={onClick}
		class="box rounded-lg px-3 py-3 shadow-md text-left"
		class:has-icon={!!$$slots.icon}
		class:has-content={!!$$slots.content}
	>
		{#if $$slots.icon}
			<div class="icon">
				<slot name="icon" />
			</div>
		{/if}

		<div class="heading">
			<slot />
		</div>

		{#if $$slots.content}
			<div class="content text-sm col-[2] row-[2]">
				<slot name="content" />
			</div>
		{/if}
	</svelte:element>
</div>

<style lang="scss">
	.box {
		background-color: var(--surface-1);
		width: fit-content;
		max-width: 600px;
		margin: 2rem auto;

		display: grid;
		row-gap: 0.25rem;
		column-gap: 0.5rem;

		grid-template-columns: auto;
		grid-template-rows: auto;

		&.has-icon {
			grid-template-columns: auto auto;
		}

		&.has-content {
			grid-template-rows: auto auto;
		}
	}

	.content {
		color: var(--text-1);
	}
</style>
