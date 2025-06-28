<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { startRegistration } from '@simplewebauthn/browser';

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	let accessCode: string = $state('');
	let output = $state('');

	async function beginRegistration() {
		if (!accessCode) return;

		if (accessCode !== page.url.searchParams.get('token')) {
			await goto('/register?token=' + accessCode, { keepFocus: true, invalidateAll: true });
		}

		if (!data.options) {
			alert('Invalid registration code. Please try again.');
			return;
		}

		try {
			const reg = await startRegistration({ optionsJSON: data.options! });
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ reg: reg, token: data.token! })
			});
			const result = await res.json();
			output = JSON.stringify(result, null, 2);
		} catch (error) {
			alert(`Error: ${error}`);
		}
	}

	onMount(() => {
		if (page.url.searchParams.has('token')) {
			accessCode = page.url.searchParams.get('token') || '';
		}
	});
</script>

<input bind:value={accessCode} />

<button onclick={beginRegistration}> Begin Registration </button>

<pre>
	<code>{output}</code>
</pre>
