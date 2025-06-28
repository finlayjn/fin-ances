<script lang="ts">
	import { startAuthentication } from '@simplewebauthn/browser';

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	let output = $state('');

	async function beginAuthentication() {
		try {
			const auth = await startAuthentication({ optionsJSON: data.options });
			const res = await fetch('/signin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ reg: auth, token: data.token })
			});
			const result = await res.json();
			output = JSON.stringify(result, null, 2);
		} catch (error) {
			alert(`Error: ${error}`);
		}
	}
</script>

<button onclick={beginAuthentication}> Begin Authentication </button>

<pre>
    <code>{output}</code>
</pre>
