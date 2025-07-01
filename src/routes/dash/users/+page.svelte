<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	function getColor(role: string): string {
		switch (role) {
			case 'admin':
				return 'badge-primary';
			case 'manager':
				return 'badge-secondary';
			case 'staff':
				return 'badge-accent';
			default:
				return 'badge-ghost';
		}
	}
</script>

<div class="overflow-x-auto">
	<table class="table">
		<thead>
			<tr>
				<th>Details</th>
				<th>Email</th>
				<th>Role</th>
				<th>Last Login</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.users ?? [] as user}
				<tr>
					<td>
						<div class="flex items-center gap-3">
							<div>
								<div class="font-bold">{user.firstName} {user.lastName}</div>
								<div class="text-sm opacity-50">
									{user.clientNames}
								</div>
							</div>
						</div>
					</td>
					<td> {user.email} </td>
					<td>
						<span class="badge {getColor(user.role)} badge-sm">{user.role}</span>
					</td>
					<td> {user.lastLogin} </td>
					<th>
						<div class="flex justify-end">
							<a href={`/dash/users/${user.id}`} class="btn btn-ghost btn-xs">Edit</a>
						</div>
					</th>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<th>Details</th>
				<th>Email</th>
				<th>Role</th>
				<th>Last Login</th>
				<th></th>
			</tr>
		</tfoot>
	</table>
</div>
