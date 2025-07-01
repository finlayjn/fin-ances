<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidateAll } from '$app/navigation';
	let { data }: PageProps = $props();

	async function deletePasskey(passkeyId: number) {
		const res = await fetch(`/dash/users/${data.user.id}/passkey/${passkeyId}`, {
			method: 'DELETE'
		});
		if (res.ok) await invalidateAll();
		else alert('Failed to revoke passkey.');
	}
</script>

<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
	<legend class="fieldset-legend">Passkeys</legend>
	{#if data.user.passkeys.length === 0}
		<p class="label">No passkeys registered.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Created</th>
						<th>Last Used</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each data.user.passkeys as passkey}
						<tr>
							<td>{new Date(passkey.createdAt).toLocaleString()}</td>
							<td>{passkey.lastUsedAt ? new Date(passkey.lastUsedAt).toLocaleString() : 'Never'}</td
							>
							<th>
								<div class="flex justify-end">
									<button
										type="button"
										class="btn btn-error btn-xs"
										onclick={() => deletePasskey(passkey.id)}>Revoke</button
									>
								</div>
							</th>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</fieldset>
