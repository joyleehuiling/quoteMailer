<script lang="ts">
	import { useQuery } from 'convex-svelte'; // [Convex] real-time subscription
	import { SvelteSet } from 'svelte/reactivity'; // [Svelte 5] reactive Set — mutations trigger re-renders without reassignment
	import { api } from '../../convex/_generated/api';
	import type { Id } from '../../convex/_generated/dataModel';

	// Props
	let {
		projectId,
		onChange,
	}: {
		projectId: string;
		onChange: (to: string[], cc: string[]) => void;
	} = $props();

	// [Convex] args in a function so the query reruns if projectId changes
	const contacts = useQuery(api.contacts.list, () => ({
		projectId: projectId as Id<'projects'>,
	}));

	// SvelteSet is mutated in place — no need to reassign to trigger reactivity [Svelte 5]
	let toIds = new SvelteSet<string>();
	let ccIds = new SvelteSet<string>();

	// Effect 1 — initialise toIds from isDefault contacts when data loads.
	// Mutates SvelteSet in place; does not reassign toIds. [Svelte 5]
	$effect(() => {
		if (!contacts.data) return;
		toIds.clear();
		for (const c of contacts.data) {
			if (c.isDefault) toIds.add(c._id);
		}
	});

	// Effect 2 — notify parent whenever selections change.
	// Derives email arrays inline; assigns no state. [Svelte 5]
	$effect(() => {
		if (!contacts.data) return;
		const toEmails = [...toIds]
			.map((id) => contacts.data!.find((c) => c._id === id)?.email ?? '')
			.filter(Boolean);
		const ccEmails = [...ccIds]
			.map((id) => contacts.data!.find((c) => c._id === id)?.email ?? '')
			.filter(Boolean);
		onChange(toEmails, ccEmails);
	});

	function toggleTo(id: string, checked: boolean) {
		if (checked) {
			toIds.add(id);
			ccIds.delete(id); // a contact can only be in one section at a time
		} else {
			toIds.delete(id);
		}
	}

	function toggleCc(id: string, checked: boolean) {
		if (checked) {
			ccIds.add(id);
			toIds.delete(id); // a contact can only be in one section at a time
		} else {
			ccIds.delete(id);
		}
	}
</script>

{#if contacts.isLoading}
	<!-- Loading skeleton -->
	<div class="space-y-2">
		{#each { length: 3 } as _, i (i)}
			<div class="h-4 w-64 animate-pulse rounded bg-gray-200"></div>
		{/each}
	</div>

{:else if contacts.error}
	<p class="text-sm text-red-600">Failed to load contacts: {contacts.error.toString()}</p>

{:else if contacts.data.length === 0}
	<p class="text-sm text-gray-400">No contacts for this project yet.</p>

{:else}
	<div class="space-y-5">
		<!-- To section -->
		<div>
			<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">To</p>
			<div class="space-y-1">
				{#each contacts.data as contact (contact._id)}
					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							checked={toIds.has(contact._id)}
							onchange={(e) => toggleTo(contact._id, e.currentTarget.checked)}
							class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<span class="text-sm text-gray-800">{contact.name}</span>
						<span class="text-sm text-gray-400">{contact.email}</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- CC section -->
		<div>
			<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">CC</p>
			<div class="space-y-1">
				{#each contacts.data as contact (contact._id)}
					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							checked={ccIds.has(contact._id)}
							onchange={(e) => toggleCc(contact._id, e.currentTarget.checked)}
							class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<span class="text-sm text-gray-800">{contact.name}</span>
						<span class="text-sm text-gray-400">{contact.email}</span>
					</label>
				{/each}
			</div>
		</div>
	</div>
{/if}
