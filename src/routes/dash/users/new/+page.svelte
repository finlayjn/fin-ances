<script lang="ts">
	import UserDetails from '../[id]/UserDetails.svelte';
	let user = $state({});
</script>

<form method="POST">
	<UserDetails bind:user />
</form>
