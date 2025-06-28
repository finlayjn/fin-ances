<script lang="ts">
	import { startAuthentication } from '@simplewebauthn/browser';
	import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

	let result = $state('');

	async function beginAuthentication() {
		const optionsResp = await fetch('/api/authenticate');
		const { optionsJSON, token } = (await optionsResp.json()) as {
			optionsJSON: PublicKeyCredentialRequestOptionsJSON;
			token: string;
		};
		try {
			const authRes = await startAuthentication({ optionsJSON });
			const verificationResp = await fetch('/api/authenticate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ reg: authRes, token: token })
			});
			const verificationJSON = await verificationResp.json();
			result = JSON.stringify(verificationJSON, null, 2);
		} catch (error) {
			alert(`Error: ${error}`);
		}
	}
</script>

<button onclick={beginAuthentication}> Begin Authentication </button>

<pre>
    <code>{result}</code>
</pre>
