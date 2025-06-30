<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	import UserDetails from '../UserDetails.svelte';
	import Registration from './Registration.svelte';
	import Passkeys from './Passkeys.svelte';
</script>

<form method="POST" action="?/update" use:enhance>
	<UserDetails bind:user={data.user} bind:form existing />
</form>

<form method="POST" action="?/token" use:enhance>
	<Registration {data} {form} />
</form>

<Passkeys {data} {form} />
