<footer class="my-12 px-4 m-auto text-center">
	<nav>
		<ul>
			<li>
				<h2 class="text-xl mb-2">Links</h2>
			</li>

			<li>
				<a class="gradient-text" href="/">Home</a>
			</li>

			<li>
				<a href="/info">Weitere <span class="gradient-text">Infos</span> und Impressum</a>
			</li>

			<li>
				Alle Posts gehören
				<a
					class="gradient-text"
					href="https://instagram.com/funk"
					target="_blank"
					rel="noreferrer nofollow">@funk</a
				>
			</li>

			<li>
				<a href="https://github.com/Fruup/funk-finder" target="_blank" rel="noreferrer nofollow"
					><span class="gradient-text">Code</span>-Repository</a
				>
			</li>

			<li>
				<a href="https://leonscherer.com" target="_blank">
					Entwickelt von
					<span class="gradient-text">@leon</span>
				</a>
			</li>
		</ul>
	</nav>
</footer>

<style lang="scss">
	footer {
		position: relative;
		max-width: 600px;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1000;
			background-color: var(--surface-0);
		}

		li:not(:first-of-type) {
			color: var(--text-1);
		}
	}
</style>
