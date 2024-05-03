<script lang="ts">
	import '../styles/global.scss'
	import '../app.css'
</script>

<header>
	<h1>FUNK FINDER</h1>
	<p>
		Durchsuche
		<a href="https://instagram.com/funk" target="_blank" rel="noreferrer nofollow"> @funk </a> Posts
		🔍
	</p>
</header>

<slot />

<style lang="scss">
	h1 {
		font-size: 2.5rem;
		text-align: center;
	}

	header {
		height: 40vh;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		justify-content: center;
		align-items: center;
	}

	p {
		color: var(--text-1);
	}
</style>
