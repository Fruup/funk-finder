<script lang="ts">
	import { browser } from '$app/environment'
	import { get, writable } from 'svelte/store'

	let isDisabled = false

	const plannedFeatures = [
		{
			id: 'filter-images',
			text: 'Bilder ohne informatorischen Text (z. B. "Danke, dass ihr auch Info-Posts einen Like gebt") aus den Ergebnissen filtern.',
		},
		{
			id: 'pagination',
			text: 'Mehr Ergebnisse für dieselbe Suchanfrage anzeigen ("Lade mehr Posts").',
		},
		{
			id: 'include-videos',
			text: 'Videos/Reals in der Suche berücksichtigen.',
		},
	]

	const featuresPushed = (() => {
		const store = writable<string[]>(
			browser ? JSON.parse(localStorage.getItem('featuresPushed') || '[]') : [],
		)

		return {
			subscribe: store.subscribe,
			has(id: string) {
				return get(store).includes(id)
			},
			push(id: string) {
				store.update((features) => {
					const updated = [...features, id]
					localStorage.setItem('featuresPushed', JSON.stringify(updated))
					return updated
				})
			},
		}
	})()

	async function handleAction(id: string) {
		if (featuresPushed.has(id)) return

		isDisabled = true

		try {
			const response = await fetch(`/api/v1/features/${id}/push`, { method: 'POST' })
			if (response.ok) {
				// Store in local storage.
				featuresPushed.push(id)
			}
		} catch (e) {
			console.error(e)
		} finally {
			isDisabled = false
		}
	}
</script>

<div class="mx-6">
	<div class="page max-w-[600px] m-auto">
		<h2>Was geht hier ab?</h2>
		<div class="content">
			<p>
				Im Dschungel der unzähligen Instagram-Posts von <a
					class="gradient-text"
					href="https://instagram.com/funk"
					target="_blank"
					rel="noreferrer nofollow">@funk</a
				>
				ist die Suche nach einem ganz <em>bestimmten</em> gar nicht leicht. Diese Seite ermöglicht
				es, alle Posts nach einem ungefähren Text oder Thema zu durchsuchen. Die Ergebnisse werden
				sortiert nach ihrer Übereinstimmung mit der Suchanfrage angezeigt.
				<br />
				Aktuell ist es nur möglich, einfache Bild-Posts zu durchsuchen - also keine Videos oder Stories.
			</p>
		</div>

		<h2>Disclaimer</h2>
		<div class="content">
			<p>
				Alle Posts und Bilder, die auf dieser Seite zu sehen sind, gehören dem Instagram-Account <a
					class="gradient-text"
					href="https://instagram.com/funk"
					target="_blank"
					rel="nofollow noreferrer">@funk</a
				>. Es werden keine Kopien der Bilddateien gespeichert. Alle Bilder führen über einen Link zu
				ihrem jeweiligen Instagram-Post.
				<br />
				Diese Seite bietet lediglich eine Ansicht der Posts und eine Möglichkeit, diese mithilfe von
				Texteingaben zu durchsuchen.
			</p>
		</div>

		<h2>Geplante Features</h2>
		<div class="content">
			<p>
				Die folgenden Features sind entweder in Bearbeitung oder noch unbestimmt. Wenn du ein
				Feature besonders hilfreich findest, gib ihm einen Push! 🎉
			</p>

			<ul class="list-disc list-outside pl-4">
				{#each plannedFeatures as { text, id }}
					{@const isSet = $featuresPushed.includes(id)}
					{@const title = isSet
						? 'Dein Feedback ist eingegangen ☺️'
						: 'Gib emotionalen Support für das Feature'}

					<li class="relative">
						<span>{text}</span>
						<div class="actions inline-flex gap-1">
							<button
								type="button"
								{title}
								disabled={isSet || isDisabled}
								class="rounded-full ml-1 aspect-square w-auto h-[1lh] p-0 shadow-lg bg-slate-600 grid place-content-center hover:scale-105 transition-[scale] disabled:opacity-50 disabled:scale-100"
								on:click={() => handleAction(id)}
							>
								<span class="scale-[0.7]">
									{#if isSet}
										✔
									{:else}
										🎉
									{/if}
								</span>
							</button>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<h2>Verwendete Ressourcen</h2>
		<div class="content">
			<p>Folgende externe Ressourcen werden verwendet:</p>
			<ul>
				<li>
					<a
						class="gradient-text"
						href="https://trianglify.io/p/w:1440!h:900!x:cb00ff.ff8000!v:1!c:0.05!s:yefans!f:sh!i:0.16"
						target="_blank"
						rel="noreferrer nofollow"
					>
						Hintergrundbild
					</a>
				</li>
				<li>
					<a
						class="gradient-text"
						href="https://fonts.google.com/specimen/Freeman"
						target="_blank"
						rel="noreferrer nofollow"
					>
						Font
					</a>
				</li>
			</ul>
		</div>

		<h2>Impressum</h2>
		<div class="content">
			<p>
				Leon Scherer<br />
				c/o autorenglück.de<br />
				Franz-Mehring-Str. 15<br />
				01237 Dresden
			</p>
		</div>
	</div>
</div>

<style lang="scss">
	h2 {
		@apply text-xl;
		@apply mb-1;
	}

	.content {
		@apply text-sm;
		@apply mb-8;

		color: var(--text-1);

		> * {
			@apply mb-2;
		}
	}
</style>
