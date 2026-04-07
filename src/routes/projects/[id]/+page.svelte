<script lang="ts">
	import { page } from '$app/state'; // [Svelte 5] $app/state replaces $app/stores
	import { goto } from '$app/navigation';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import type { Id } from '../../../../convex/_generated/dataModel';

	const client = useConvexClient();

	// ── Derived route param ──────────────────────────────────────────────────
	// [Svelte 5] page from $app/state is a reactive object — no $ prefix needed
	const id = $derived(page.params.id as Id<'projects'>);

	// ── Section 1: Project ───────────────────────────────────────────────────
	const project = useQuery(api.projects.getById, () => ({ id }));

	let editing = $state(false);
	let editName = $state('');
	let editCode = $state('');
	let editClientName = $state('');
	let saveError = $state('');

	function startEdit() {
		if (!project.data) return;
		editName = project.data.name;
		editCode = project.data.code;
		editClientName = project.data.clientName;
		saveError = '';
		editing = true;
	}

	async function saveProject() {
		saveError = '';
		try {
			await client.mutation(api.projects.update, {
				id,
				name: editName,
				code: editCode,
				clientName: editClientName
			});
			editing = false;
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Failed to save.';
		}
	}

	async function archiveProject() {
		if (!confirm('Archive this project?')) return;
		try {
			await client.mutation(api.projects.archive, { id });
			goto('/projects');
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Failed to archive.';
		}
	}

	// ── Section 2: Quotations ────────────────────────────────────────────────
	const quotations = useQuery(api.quotations.listByProject, () => ({ projectId: id }));

	const badgeClass: Record<string, string> = {
		draft: 'bg-amber-100 text-amber-800',
		sending: 'bg-gray-100 text-gray-700',
		sent: 'bg-green-100 text-green-800',
		finalised: 'bg-blue-100 text-blue-800'
	};

	// ── Section 3: Contacts ──────────────────────────────────────────────────
	const contacts = useQuery(api.contacts.list, () => ({ projectId: id }));

	let editingContactId = $state<string | null>(null);
	let editContact = $state({ name: '', email: '', role: '' });
	let contactSaveError = $state('');

	function startEditContact(doc: { _id: string; name: string; email: string; role?: string }) {
		editingContactId = doc._id;
		editContact = { name: doc.name, email: doc.email, role: doc.role ?? '' };
		contactSaveError = '';
	}

	async function saveContact() {
		if (!editingContactId) return;
		contactSaveError = '';
		try {
			await client.mutation(api.contacts.update, {
				id: editingContactId as Id<'contacts'>,
				name: editContact.name,
				email: editContact.email,
				role: editContact.role
			});
			editingContactId = null;
		} catch (err) {
			contactSaveError = err instanceof Error ? err.message : 'Failed to save contact.';
		}
	}

	async function deleteContact(contactId: Id<'contacts'>) {
		try {
			await client.mutation(api.contacts.remove, { id: contactId });
		} catch (err) {
			contactSaveError = err instanceof Error ? err.message : 'Failed to delete contact.';
		}
	}

	// Add contact form
	let newName = $state('');
	let newEmail = $state('');
	let newRole = $state('');
	let newIsDefault = $state(false);
	let addingSaving = $state(false);
	let addingError = $state('');

	async function handleAddContact(e: SubmitEvent) {
		e.preventDefault();
		addingSaving = true;
		addingError = '';
		try {
			await client.mutation(api.contacts.create, {
				projectId: id,
				name: newName,
				email: newEmail,
				role: newRole || undefined,
				isDefault: newIsDefault || undefined
			});
			newName = '';
			newEmail = '';
			newRole = '';
			newIsDefault = false;
		} catch (err) {
			addingError = err instanceof Error ? err.message : 'Failed to add contact.';
		} finally {
			addingSaving = false;
		}
	}
</script>

<div class="p-6">
	<!-- ── Section 1: Project Info ──────────────────────────────────────────── -->
	{#if project.isLoading}
		<div class="animate-pulse space-y-3">
			<div class="h-7 w-48 rounded bg-gray-200"></div>
			<div class="h-4 w-64 rounded bg-gray-200"></div>
			<div class="h-4 w-56 rounded bg-gray-200"></div>
		</div>
	{:else if project.error != null}
		<p class="text-sm text-red-600">Failed to load project: {project.error.toString()}</p>
	{:else if project.data == null}
		<p class="text-sm text-gray-500">Project not found.</p>
	{:else}
		<div class="flex items-start justify-between">
			<h1 class="text-2xl font-semibold text-gray-900">{project.data.name}</h1>
			<button
				type="button"
				onclick={archiveProject}
				class="rounded border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
			>
				Archive
			</button>
		</div>

		<div class="mt-4 rounded-lg border border-gray-200 bg-white p-5">
			{#if editing}
				<div class="space-y-4">
					<div>
						<label for="edit-name" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
						<input
							id="edit-name"
							type="text"
							bind:value={editName}
							class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label for="edit-code" class="mb-1 block text-sm font-medium text-gray-700">Code</label>
						<input
							id="edit-code"
							type="text"
							bind:value={editCode}
							class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label for="edit-client" class="mb-1 block text-sm font-medium text-gray-700">Client Name</label>
						<input
							id="edit-client"
							type="text"
							bind:value={editClientName}
							class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					{#if saveError}
						<p class="text-sm text-red-600">{saveError}</p>
					{/if}
					<div class="flex gap-2">
						<button
							type="button"
							onclick={saveProject}
							class="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
						>
							Save
						</button>
						<button
							type="button"
							onclick={() => (editing = false)}
							class="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
					</div>
				</div>
			{:else}
				<dl class="space-y-3 text-sm">
					<div class="flex gap-2">
						<dt class="w-28 font-medium text-gray-500">Name</dt>
						<dd class="text-gray-900">{project.data.name}</dd>
					</div>
					<div class="flex gap-2">
						<dt class="w-28 font-medium text-gray-500">Code</dt>
						<dd class="text-gray-900">{project.data.code}</dd>
					</div>
					<div class="flex gap-2">
						<dt class="w-28 font-medium text-gray-500">Client Name</dt>
						<dd class="text-gray-900">{project.data.clientName}</dd>
					</div>
				</dl>
				<button
					type="button"
					onclick={startEdit}
					class="mt-4 rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
				>
					Edit
				</button>
			{/if}
		</div>
	{/if}

	<!-- ── Section 2: Quotations ────────────────────────────────────────────── -->
	<div class="mt-8">
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-lg font-medium text-gray-900">Quotations</h2>
			<a
				href="/quotes/new?projectId={id}"
				class="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
			>
				New Quote
			</a>
		</div>

		{#if quotations.isLoading}
			<div class="animate-pulse space-y-2">
				{#each { length: 3 } as _, i (i)}
					<div class="h-8 w-full rounded bg-gray-200"></div>
				{/each}
			</div>
		{:else if quotations.error != null}
			<p class="text-sm text-red-600">Failed to load quotations: {quotations.error.toString()}</p>
		{:else if !quotations.data || quotations.data.length === 0}
			<p class="text-sm text-gray-500">No quotations yet.</p>
		{:else}
			<div class="overflow-hidden rounded-lg border border-gray-200">
				<table class="w-full divide-y divide-gray-200 text-sm">
					<thead class="bg-gray-50">
						<tr>
							{#each ['Ref Number', 'Title', 'Total', 'Status', 'Action'] as col (col)}
								<th
									class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									{col}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each quotations.data as doc (doc._id)}
							<tr class="hover:bg-gray-50">
								<td class="px-4 py-3 text-gray-900">{doc.quoteNumber}</td>
								<td class="px-4 py-3 text-gray-900">{doc.title}</td>
								<td class="px-4 py-3 text-gray-900">
									{doc.currency} {doc.totalAmount.toLocaleString()}
								</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {badgeClass[doc.status] ?? 'bg-gray-100 text-gray-700'}"
									>
										{doc.status}
									</span>
								</td>
								<td class="px-4 py-3">
									<a href="/quotes/{doc._id}" class="text-indigo-600 hover:underline">View</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- ── Section 3: Email Directory ───────────────────────────────────────── -->
	<div class="mt-8">
		<h2 class="mb-3 text-lg font-medium text-gray-900">Email Directory</h2>

		{#if contacts.isLoading}
			<div class="animate-pulse space-y-2">
				{#each { length: 3 } as _, i (i)}
					<div class="h-8 w-full rounded bg-gray-200"></div>
				{/each}
			</div>
		{:else if contacts.error != null}
			<p class="text-sm text-red-600">Failed to load contacts: {contacts.error.toString()}</p>
		{:else if !contacts.data || contacts.data.length === 0}
			<p class="text-sm text-gray-500">No contacts yet.</p>
		{:else}
			{#if contactSaveError}
				<p class="mb-2 text-sm text-red-600">{contactSaveError}</p>
			{/if}
			<div class="overflow-hidden rounded-lg border border-gray-200">
				<table class="w-full divide-y divide-gray-200 text-sm">
					<thead class="bg-gray-50">
						<tr>
							{#each ['Name', 'Email', 'Role', 'Default', 'Actions'] as col (col)}
								<th
									class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									{col}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each contacts.data as doc (doc._id)}
							<tr class="hover:bg-gray-50">
								{#if editingContactId === doc._id}
									<td class="px-4 py-2">
										<input
											type="text"
											bind:value={editContact.name}
											class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
										/>
									</td>
									<td class="px-4 py-2">
										<input
											type="email"
											bind:value={editContact.email}
											class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
										/>
									</td>
									<td class="px-4 py-2">
										<input
											type="text"
											bind:value={editContact.role}
											class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
										/>
									</td>
									<td class="px-4 py-2 text-gray-500">—</td>
									<td class="px-4 py-2">
										<div class="flex gap-2">
											<button
												type="button"
												onclick={saveContact}
												class="text-sm text-indigo-600 hover:underline"
											>
												Save
											</button>
											<button
												type="button"
												onclick={() => (editingContactId = null)}
												class="text-sm text-gray-500 hover:underline"
											>
												Cancel
											</button>
										</div>
									</td>
								{:else}
									<td class="px-4 py-3 text-gray-900">{doc.name}</td>
									<td class="px-4 py-3 text-gray-900">{doc.email}</td>
									<td class="px-4 py-3 text-gray-500">{doc.role ?? '—'}</td>
									<td class="px-4 py-3 text-center text-gray-900">
										{doc.isDefault ? '✓' : ''}
									</td>
									<td class="px-4 py-3">
										<div class="flex gap-2">
											<button
												type="button"
												onclick={() =>
													startEditContact({
														_id: doc._id,
														name: doc.name,
														email: doc.email,
														role: doc.role
													})}
												class="text-sm text-indigo-600 hover:underline"
											>
												Edit
											</button>
											<button
												type="button"
												onclick={() => deleteContact(doc._id as Id<'contacts'>)}
												class="text-sm text-red-600 hover:underline"
											>
												Delete
											</button>
										</div>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<!-- Add Contact form -->
		<div class="mt-8">
			<h3 class="mb-3 text-lg font-medium text-gray-900">Add Contact</h3>
			<form onsubmit={handleAddContact} class="max-w-md space-y-4">
				<div>
					<label for="new-name" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
					<input
						id="new-name"
						type="text"
						bind:value={newName}
						required
						class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>
				<div>
					<label for="new-email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
					<input
						id="new-email"
						type="email"
						bind:value={newEmail}
						required
						class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>
				<div>
					<label for="new-role" class="mb-1 block text-sm font-medium text-gray-700"
						>Role <span class="text-gray-400">(optional)</span></label
					>
					<input
						id="new-role"
						type="text"
						bind:value={newRole}
						class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>
				<div class="flex items-center gap-2">
					<input
						id="new-isDefault"
						type="checkbox"
						bind:checked={newIsDefault}
						class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
					/>
					<label for="new-isDefault" class="text-sm font-medium text-gray-700">Set as default</label>
				</div>
				{#if addingError}
					<p class="text-sm text-red-600">{addingError}</p>
				{/if}
				<button
					type="submit"
					disabled={addingSaving}
					class="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{addingSaving ? 'Adding...' : 'Add Contact'}
				</button>
			</form>
		</div>
	</div>
</div>
