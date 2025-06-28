<script lang="ts">
	import { startRegistration } from '@simplewebauthn/browser';
	import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';

	let accessCode: string = $state('');
	let result = $state('');

	async function beginRegistration() {
		const optionsResp = await fetch(`/api/register?token=${accessCode}`);
		const { optionsJSON, token } = (await optionsResp.json()) as {
			optionsJSON: PublicKeyCredentialCreationOptionsJSON;
			token: string;
		};
		try {
			const regRes = await startRegistration({ optionsJSON });
			const verificationResp = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ reg: regRes, token: token })
			});
			const verificationJSON = await verificationResp.json();
			result = JSON.stringify(verificationJSON, null, 2);
		} catch (error) {
			alert(`Error: ${error}`);
		}
	}
</script>

<input bind:value={accessCode} type="password" />

<button onclick={beginRegistration}> Begin Registration </button>

<pre>
	<code>{result}</code>
</pre>
