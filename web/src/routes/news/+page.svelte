<script lang="ts">
	import type { News } from '@funk-finder/db/types/models'
	import Page from '../Page.svelte'

	export let data
	const { news } = data

	const severityClasses: Record<News['severity'], string> = {
		info: 'border-green-600 bg-green-600',
		warn: 'border-yellow-600 bg-yellow-600',
		alert: 'bg-red-700 border-red-700',
	}

	const formatDate = (date: string) =>
		new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(
			new Date(date),
		)
</script>

<Page>
	{#each news as { heading, body, severity, updated }}
		<article class="mb-8 p-6 pb-5 rounded-lg border bg-opacity-20 {severityClasses[severity]}">
			<h2 class="text-xl mb-0 leading-none">{heading}</h2>
			<p class="mt-0 mb-2 text-xs text-gray-400">
				{formatDate(updated)}
			</p>
			<div class="text-sm text-[--text-1]">
				{@html body}
			</div>
		</article>
	{/each}

	{#if !news.length}
		<p class="text-center">Aktuell gibt es nichts zu berichten 🐋</p>
	{/if}
</Page>

<style lang="scss">
</style>
