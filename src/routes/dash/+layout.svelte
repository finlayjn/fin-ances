<script lang="ts">
	import type { LayoutProps } from './$types';
	let { data, children }: LayoutProps = $props();
</script>

<div class="drawer lg:drawer-open">
	<input id="sidebar-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<div class="navbar bg-base-100 sticky top-0 shadow-sm">
			<div class="flex-none">
				<label
					for="sidebar-drawer"
					aria-label="Open Sidebar"
					class="btn btn-ghost btn-square drawer-button m-4 lg:hidden"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block h-5 w-5 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path>
					</svg>
				</label>
			</div>
			<div class="flex flex-1">
				<h2 class="mx-5 text-xl font-bold">Dashboard</h2>
			</div>
		</div>

		<main class="container mx-auto max-w-3xl p-4">
			{@render children()}
		</main>
	</div>
	<div class="drawer-side">
		<label for="sidebar-drawer" aria-label="Close Sidebar" class="drawer-overlay"></label>
		<aside
			class="menu bg-base-200 text-base-content flex min-h-full w-64 flex-col justify-between p-4 z-20"
		>
			<div>
				<h2 class="text-xl font-bold">{data.title}</h2>
				<h3 class="mb-4 text-lg opacity-50">{data.subtitle}</h3>
				<ul>
					<li><a class="menu-active" href="/dash">Dashboard</a></li>
					<li><a href="/invoices">Invoices</a></li>
					<li><a href="/products">Products</a></li>
					<li><a href="/timesheets">Timesheets</a></li>
					<li><a href="/projects">Projects</a></li>
					<li><a href="/users">Users</a></li>
					<li><a href="/settings">Settings</a></li>
				</ul>
			</div>
			<div class="mt-8">
				<div class="bg-base-100 flex items-center gap-3 rounded-xl p-3 shadow">
					<div>
						<div class="font-bold">{data.user?.firstName} {data.user?.lastName}</div>
						<div class="text-base-content/60 mb-2 text-sm">{data.user?.email}</div>
						<div>
							<a class="link link-hover" href="/dash/profile"> Edit Profile </a> |
							<a class="link link-hover" href="/auth/signout"> Sign Out </a>
						</div>
					</div>
				</div>
				<p class="mt-2 text-center text-sm opacity-50">
					Powered by
					<a class="link link-hover" href="https://github.com/finlayjn/fin-ances"> fin-ances </a>
				</p>
			</div>
		</aside>
	</div>
</div>
