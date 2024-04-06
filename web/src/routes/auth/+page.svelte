<script lang="ts">
	import { page } from '$app/stores'
	import api from '$lib/api'

	const href = api.getAuthorizationUrl()
</script>

<a {href} target="_blank" rel="noopener noreferrer"> Authorize the application here </a>
