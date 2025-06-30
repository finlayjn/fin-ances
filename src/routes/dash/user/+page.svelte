<script lang="ts">
	import UserDetails from './UserDetails.svelte';
	let user = $state({});
</script>

<form method="POST">
	<UserDetails bind:user />
</form>
