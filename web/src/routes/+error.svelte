<script lang="ts">
	import Page from './Page.svelte'
	import { page } from '$app/stores'
</script>

<Page>
	<h2>{$page.error?.message || 'Error'}</h2>
</Page>
