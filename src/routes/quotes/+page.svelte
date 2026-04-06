<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	const quotations = useQuery(api.quotations.list, () => ({}));

	const statusClasses: Record<string, string> = {
		draft: 'bg-amber-100 text-amber-800',
		sent: 'bg-green-100 text-green-800',
		finalised: 'bg-blue-100 text-blue-800'
	};
</script>

<div class="p-6">
	<!-- Page header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-xl font-medium text-gray-900">Quotations</h1>
		<a
			href="/quotes/new"
			class="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
		>
			New Quotation
		</a>
	</div>

	<!-- Loading state -->
	{#if quotations.isLoading}
		<div class="w-full overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full divide-y divide-gray-200 text-sm">
				<thead class="bg-gray-50">
					<tr>
						{#each ['Ref Number', 'Title', 'Total', 'Status', 'Created', 'Action'] as col (col)}
							<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each { length: 3 } as _, i (i)}
						<tr>
							<td class="px-4 py-3"><div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-40 animate-pulse rounded bg-gray-200"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-20 animate-pulse rounded bg-gray-200"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-16 animate-pulse rounded bg-gray-200"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-12 animate-pulse rounded bg-gray-200"></div></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

	<!-- Error state -->
	{:else if quotations.error != null}
		<p class="text-sm text-red-600">Failed to load: {quotations.error.toString()}</p>

	<!-- Empty state -->
	{:else if quotations.data.length === 0}
		<div class="flex flex-col items-center justify-center gap-4 py-16">
			<p class="text-gray-500">No quotations yet</p>
			<a
				href="/quotes/new"
				class="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
			>
				Create your first quotation
			</a>
		</div>

	<!-- Table -->
	{:else}
		<div class="w-full overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full divide-y divide-gray-200 text-sm">
				<thead class="bg-gray-50">
					<tr>
						{#each ['Ref Number', 'Title', 'Total', 'Status', 'Created', 'Action'] as col (col)}
							<th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each quotations.data as doc (doc._id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3 text-gray-900">{doc.quoteNumber}</td>
							<td class="px-4 py-3 text-gray-900">{doc.title}</td>
							<td class="px-4 py-3 text-gray-900">{doc.currency} {doc.totalAmount.toLocaleString()}</td>
							<td class="px-4 py-3">
								<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusClasses[doc.status] ?? ''}">
									{doc.status}
								</span>
							</td>
							<td class="px-4 py-3 text-gray-500">{new Date(doc._creationTime).toLocaleDateString()}</td>
							<td class="px-4 py-3">
								<a href="/quotes/{doc._id}" class="text-sm text-indigo-600 hover:underline">View</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
