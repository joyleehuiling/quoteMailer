<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { goto } from '$app/navigation';
	import { api } from '../../../../convex/_generated/api';
	import type { Id } from '../../../../convex/_generated/dataModel';

	const projects = useQuery(api.projects.list, () => ({}));
	const client = useConvexClient();

	// Form fields
	let projectId = $state('');
	let quoteNumber = $state('');
	let title = $state('');
	let createdBy = $state('');
	let currency = $state('MYR');
	let notes = $state('');

	// Line items
	type LineItem = { description: string; quantity: number; unit: string; unitRate: number };
	let lineItems = $state<LineItem[]>([{ description: '', quantity: 1, unit: 'm²', unitRate: 0 }]);

	let totalAmount = $derived(
		lineItems.reduce((sum, item) => sum + item.quantity * item.unitRate, 0)
	);

	function addItem() {
		lineItems = [...lineItems, { description: '', quantity: 1, unit: 'm²', unitRate: 0 }];
	}

	function removeItem(index: number) {
		lineItems = lineItems.filter((_, i) => i !== index);
	}

	// Submit
	let saving = $state(false);
	let error = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!projectId) { error = 'Please select a project.'; return; }
		if (!quoteNumber.trim()) { error = 'Ref Number is required.'; return; }
		if (!title.trim()) { error = 'Description is required.'; return; }
		if (!createdBy.trim()) { error = 'Created By is required.'; return; }
		if (!lineItems.some((item) => item.description.trim())) {
			error = 'At least one line item with a description is required.';
			return;
		}

		saving = true;
		try {
			await client.mutation(api.quotations.create, {
				projectId: projectId as Id<'projects'>,
				quoteNumber: quoteNumber.trim(),
				title: title.trim(),
				lineItems: lineItems.map((item) => ({
					description: item.description,
					quantity: item.quantity,
					unit: item.unit,
					unitRate: item.unitRate,
				})),
				totalAmount,
				currency,
				notes: notes.trim() || undefined,
				createdBy: createdBy.trim(),
			});
			goto('/quotes');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong.';
		} finally {
			saving = false;
		}
	}
</script>

<div class="max-w-4xl p-6">
	<h1 class="mb-6 text-xl font-medium text-gray-900">New Quotation</h1>

	<form onsubmit={handleSubmit}>
		<!-- Main fields grid -->
		<div class="grid grid-cols-2 gap-4">
			<!-- Project -->
			<div>
				<label for="project" class="mb-1 block text-sm font-medium text-gray-700">Project</label>
				<select
					id="project"
					bind:value={projectId}
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				>
					<option value="">
						{projects.isLoading ? 'Loading...' : '— Select a project —'}
					</option>
					{#if !projects.isLoading && projects.data}
						{#each projects.data as project (project._id)}
							<option value={project._id}>{project.name} ({project.code})</option>
						{/each}
					{/if}
				</select>
			</div>

			<!-- Ref Number -->
			<div>
				<label for="quoteNumber" class="mb-1 block text-sm font-medium text-gray-700">Ref Number</label>
				<input
					id="quoteNumber"
					type="text"
					bind:value={quoteNumber}
					placeholder="QT-2024-001"
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>

			<!-- Description -->
			<div>
				<label for="title" class="mb-1 block text-sm font-medium text-gray-700">Description</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					placeholder="Structural works - Level 3"
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>

			<!-- Created By -->
			<div>
				<label for="createdBy" class="mb-1 block text-sm font-medium text-gray-700">Created By</label>
				<input
					id="createdBy"
					type="text"
					bind:value={createdBy}
					placeholder="Your name"
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
			</div>

			<!-- Currency -->
			<div>
				<label for="currency" class="mb-1 block text-sm font-medium text-gray-700">Currency</label>
				<select
					id="currency"
					bind:value={currency}
					class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				>
					<option value="MYR">MYR</option>
					<option value="USD">USD</option>
					<option value="SGD">SGD</option>
				</select>
			</div>

			<!-- Notes (full width) -->
			<div class="col-span-2">
				<label for="notes" class="mb-1 block text-sm font-medium text-gray-700">Notes <span class="text-gray-400">(optional)</span></label>
				<textarea
					id="notes"
					bind:value={notes}
					placeholder="Any additional notes..."
					rows="3"
					class="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
				></textarea>
			</div>
		</div>

		<!-- Line items -->
		<p class="mb-2 mt-6 text-sm font-semibold text-gray-700">Line Items</p>
		<div class="overflow-hidden rounded border border-gray-200">
			<table class="w-full text-sm">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
						<th class="w-20 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Qty</th>
						<th class="w-24 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Unit</th>
						<th class="w-32 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Unit Rate ({currency})</th>
						<th class="w-32 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
						<th class="w-10 px-3 py-2"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 bg-white">
					{#each lineItems as item, i (i)}
						<tr>
							<td class="px-3 py-2">
								<input
									type="text"
									bind:value={item.description}
									placeholder="e.g. Concrete works"
									class="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
								/>
							</td>
							<td class="px-3 py-2">
								<input
									type="number"
									bind:value={item.quantity}
									min="0"
									step="any"
									class="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
								/>
							</td>
							<td class="px-3 py-2">
								<input
									type="text"
									bind:value={item.unit}
									placeholder="m²"
									class="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
								/>
							</td>
							<td class="px-3 py-2">
								<input
									type="number"
									bind:value={item.unitRate}
									min="0"
									step="any"
									class="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
								/>
							</td>
							<td class="px-3 py-2 text-right text-gray-700">
								{(item.quantity * item.unitRate).toLocaleString()}
							</td>
							<td class="px-3 py-2 text-center">
								<button
									type="button"
									onclick={() => removeItem(i)}
									disabled={lineItems.length === 1}
									class="text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
								>×</button>
							</td>
						</tr>
					{/each}
					<!-- Total row -->
					<tr class="bg-gray-50 font-medium">
						<td colspan="4" class="px-3 py-2 text-right text-sm text-gray-700">Total</td>
						<td class="px-3 py-2 text-right text-sm text-gray-900">{currency} {totalAmount.toLocaleString()}</td>
						<td></td>
					</tr>
				</tbody>
			</table>
		</div>

		<button
			type="button"
			onclick={addItem}
			class="mt-2 text-sm text-indigo-600 hover:underline"
		>
			+ Add Item
		</button>

		<!-- Submit row -->
		<div class="mt-6 flex items-center">
			<button
				type="submit"
				disabled={saving}
				class="rounded bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
			>
				{saving ? 'Saving...' : 'Save Quotation'}
			</button>
			<a href="/quotes" class="ml-4 text-sm text-gray-500 hover:underline">Cancel</a>
			{#if error}
				<p class="ml-4 text-sm text-red-600">{error}</p>
			{/if}
		</div>
	</form>
</div>
