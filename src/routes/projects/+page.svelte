<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const projects = useQuery(api.projects.list, () => ({}));
	const client = useConvexClient();

	let name = $state('');
	let code = $state('');
	let clientName = $state('');
	let saving = $state(false);
	let error = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		error = '';
		try {
			await client.mutation(api.projects.create, { name, code, clientName });
			name = '';
			code = '';
			clientName = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred.';
		} finally {
			saving = false;
		}
	}
</script>

<div class="p-6">
	<!-- Page header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-xl font-medium text-gray-900">Projects</h1>
	</div>

	<!-- Loading state -->
	{#if projects.isLoading}
		<div class="w-full overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full divide-y divide-gray-200 text-sm">
				<thead class="bg-gray-50">
					<tr>
						{#each ['Name', 'Code', 'Client Name', 'Action'] as col (col)}
							<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each { length: 3 } as _, i (i)}
						<tr>
							<td class="px-4 py-3"><div class="h-4 w-40 animate-pulse rounded bg-gray-200"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-32 animate-pulse rounded bg-gray-200"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-12 animate-pulse rounded bg-gray-200"></div></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

	<!-- Error state -->
	{:else if projects.error != null}
		<p class="text-sm text-red-600">Failed to load: {projects.error.toString()}</p>

	<!-- Empty state -->
	{:else if projects.data.length === 0}
		<div class="flex flex-col items-center justify-center gap-4 py-16">
			<p class="text-gray-500">No projects yet</p>
		</div>

	<!-- Table -->
	{:else}
		<div class="w-full overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full divide-y divide-gray-200 text-sm">
				<thead class="bg-gray-50">
					<tr>
						{#each ['Name', 'Code', 'Client Name', 'Action'] as col (col)}
							<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each projects.data as doc (doc._id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3 text-gray-900">{doc.name}</td>
							<td class="px-4 py-3 text-gray-900">{doc.code}</td>
							<td class="px-4 py-3 text-gray-900">{doc.clientName}</td>
							<td class="px-4 py-3">
								<a href="/projects/{doc._id}" class="text-sm text-indigo-600 hover:underline">View</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Add Project form -->
	<div class="mt-10">
		<h2 class="mb-4 text-lg font-medium text-gray-900">Add Project</h2>
		<form onsubmit={handleSubmit} class="max-w-md space-y-4">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>
			<div>
				<label for="code" class="mb-1 block text-sm font-medium text-gray-700">Code</label>
				<input
					id="code"
					type="text"
					bind:value={code}
					required
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>
			<div>
				<label for="clientName" class="mb-1 block text-sm font-medium text-gray-700">Client Name</label>
				<input
					id="clientName"
					type="text"
					bind:value={clientName}
					required
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>
			<div>
				<button
					type="submit"
					disabled={saving}
					class="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{saving ? 'Saving...' : 'Add Project'}
				</button>
				{#if error}
					<p class="mt-2 text-sm text-red-600">{error}</p>
				{/if}
			</div>
		</form>
	</div>
</div>
