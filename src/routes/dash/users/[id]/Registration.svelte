<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	let { data, form }: PageProps = $props();
	let invalidate = $state(false);
	let copied = $state(false);
	function copyAccessCode() {
		const accessCode = form?.password;
		if (accessCode) {
			navigator.clipboard
				.writeText(`${page.url.origin}/auth/register?token=${accessCode}`)
				.then(() => {
					copied = true;
				})
				.catch((err) => {
					console.error('Failed to copy access code:', err);
				});
		}
	}
</script>

<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
	<legend class="fieldset-legend">Registration</legend>
	<div class="flex justify-between gap-3">
		<div class="join w-full">
			<label class="input flex-1">
				<span class="label">Access Code</span>
				<input type="text" value={form?.password ?? ''} readonly />
			</label>
			<button
				type={form?.password ? 'button' : 'submit'}
				class="btn join-item {copied ? 'btn-success' : ''}"
				onclick={() => {
					if (form?.password) {
						copyAccessCode();
					} else {
						invalidate = false;
						copied = false;
					}
				}}
			>
				{#if form?.password}
					{copied ? 'Copied!' : 'Copy Link'}
				{:else if data.user.tokenExpiration && data.user.tokenExpiration > Date.now()}
					Regenerate
				{:else}
					Generate
				{/if}
			</button>
		</div>
	</div>
	<input type="hidden" bind:value={invalidate} name="invalidate" />

	<p class="label">
		{#if data.user.tokenExpiration && data.user.tokenExpiration > Date.now()}
			Current access code expires {new Date(data.user.tokenExpiration).toLocaleString()} |
			<button
				class="link link-hover link-error"
				type="submit"
				onclick={() => {
					invalidate = true;
					copied = false;
				}}
			>
				Invalidate Now
			</button>
		{:else}
			There is no active access code for this user.
		{/if}
	</p>
</fieldset>
