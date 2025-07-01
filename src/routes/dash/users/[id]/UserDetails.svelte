<script lang="ts">
	let { user = $bindable({}), form = $bindable(), existing = false } = $props();
</script>

<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
	<legend class="fieldset-legend">Details</legend>
	<div class="mb-4 flex flex-wrap items-center gap-3 lg:flex-nowrap">
		<label class="input validator w-full">
			<span class="label">First Name</span>
			<input type="text" name="firstName" bind:value={user.firstName} required />
		</label>
		<label class="input validator w-full">
			<span class="label">Last Name</span>
			<input type="text" name="lastName" bind:value={user.lastName} required />
		</label>
	</div>
	<div class="mb-4 flex flex-wrap items-center gap-3 lg:flex-nowrap">
		<label class="input validator w-full">
			<span class="label">Email</span>
			<input type="email" name="email" bind:value={user.email} required readonly={existing} />
		</label>
		<label class="input validator w-full">
			<span class="label">Role</span>
			<select class="h-full w-full" name="role" bind:value={user.role} required>
				<option disabled selected value="">Select role</option>
				{#each ['admin', 'manager', 'staff', 'user', 'none'] as role}
					<option>{role}</option>
				{/each}
			</select>
		</label>
	</div>
	<div class="flex justify-end gap-4">
		{#if form?.success && form?.action == 'update'}
			<p class="label text-success">{form?.message}</p>
		{/if}
		<button type="submit" class="btn btn-neutral">Save</button>
	</div>
</fieldset>
