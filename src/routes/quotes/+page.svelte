<script lang="ts">
	import { createSubscriber } from 'svelte/reactivity';
	import { ConvexClient } from 'convex/browser';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { api } from '../../../convex/_generated/api';

	const client = new ConvexClient(PUBLIC_CONVEX_URL);

	function watchQuery<T>(query: any, args: Record<string, unknown> = {}): { readonly value: T | undefined } {
		let result = $state.raw<T | undefined>(undefined);
		const subscribe = createSubscriber((update) => {
			return client.onUpdate(query, args, (data: T) => {
				result = data;
				update();
			});
		});
		return {
			get value() {
				subscribe();
				return result;
			}
		};
	}

	const quotations = watchQuery<typeof api.quotations.list._returnType>(api.quotations.list);

	const statusClasses: Record<string, string> = {
		draft: 'bg-amber-100 text-amber-800',
		sent: 'bg-green-100 text-green-800',
		finalised: 'bg-blue-100 text-blue-800'
	};
</script>

<div class="p-6">
	<!-- Page header -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-xl font-medium text-gray-900">Quotations</h1>
		<a
			href="/quotes/new"
			class="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 text-sm font-medium"
		>
			New Quotation
		</a>
	</div>

	<!-- Loading state -->
	{#if quotations.value === undefined}
		<div class="w-full overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full text-sm divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref Number</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each { length: 3 } as _, i (i)}
						<tr>
							<td class="px-4 py-3"><div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-40 bg-gray-200 rounded animate-pulse"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
							<td class="px-4 py-3"><div class="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

	<!-- Empty state -->
	{:else if quotations.value.length === 0}
		<div class="flex flex-col items-center justify-center py-16 gap-4">
			<p class="text-gray-500">No quotations yet</p>
			<a
				href="/quotes/new"
				class="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 text-sm font-medium"
			>
				Create your first quotation
			</a>
		</div>

	<!-- Table with data -->
	{:else}
		<div class="w-full overflow-hidden rounded-lg border border-gray-200">
			<table class="w-full text-sm divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref Number</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each quotations.value as doc (doc._id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3 text-gray-900">{doc.quoteNumber}</td>
							<td class="px-4 py-3 text-gray-900">{doc.title}</td>
							<td class="px-4 py-3 text-gray-900">{doc.currency} {doc.totalAmount.toLocaleString()}</td>
							<td class="px-4 py-3">
								<span class="rounded-full px-2 py-0.5 text-xs font-medium {statusClasses[doc.status] ?? ''}">
									{doc.status}
								</span>
							</td>
							<td class="px-4 py-3 text-gray-900">{new Date(doc._creationTime).toLocaleDateString()}</td>
							<td class="px-4 py-3">
								<a href="/quotes/{doc._id}" class="text-indigo-600 hover:underline text-sm">View</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
