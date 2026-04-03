<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();

	const navLinks = [
		{
			href: '/quotes',
			label: 'Quotes',
			icon: 'document'
		},
		{
			href: '/quotes/new',
			label: 'New Quote',
			icon: 'plus'
		},
		{
			href: '/sent',
			label: 'Sent',
			icon: 'paper-plane'
		},
		{
			href: '/settings/contacts',
			label: 'Contacts',
			icon: 'people'
		},
		{
			href: '/settings/templates',
			label: 'Templates',
			icon: 'template'
		}
	] as const;

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen overflow-hidden bg-gray-50">
	<!-- Sidebar -->
	<aside class="flex w-56 flex-shrink-0 flex-col bg-slate-900">
		<!-- App name -->
		<div class="flex h-16 items-center px-5">
			<span class="text-lg font-bold tracking-tight text-white">QuoteMailer</span>
		</div>

		<!-- Nav links -->
		<nav class="flex flex-1 flex-col gap-1 px-3 py-2">
			{#each navLinks as link (link.href)}
				{@const active = isActive(link.href)}
				<a
					href={link.href}
					class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
						{active
						? 'bg-slate-700 text-white'
						: 'text-slate-400 hover:bg-slate-800 hover:text-white'}"
				>
					<!-- Icons -->
					{#if link.icon === 'document'}
						<svg
							class="h-4 w-4 flex-shrink-0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line x1="16" y1="13" x2="8" y2="13" />
							<line x1="16" y1="17" x2="8" y2="17" />
							<polyline points="10 9 9 9 8 9" />
						</svg>
					{:else if link.icon === 'plus'}
						<svg
							class="h-4 w-4 flex-shrink-0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
					{:else if link.icon === 'paper-plane'}
						<svg
							class="h-4 w-4 flex-shrink-0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="22" y1="2" x2="11" y2="13" />
							<polygon points="22 2 15 22 11 13 2 9 22 2" />
						</svg>
					{:else if link.icon === 'people'}
						<svg
							class="h-4 w-4 flex-shrink-0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
					{:else if link.icon === 'template'}
						<svg
							class="h-4 w-4 flex-shrink-0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
							<line x1="3" y1="9" x2="21" y2="9" />
							<line x1="9" y1="21" x2="9" y2="9" />
						</svg>
					{/if}
					{link.label}
				</a>
			{/each}
		</nav>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-y-auto bg-gray-50">
		{@render children()}
	</main>
</div>
