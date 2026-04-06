<script lang="ts">
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();
</script>

<div class="p-6">
	<h1 class="text-2xl font-semibold">Quote Detail</h1>
	<p class="mt-2 text-gray-500">Quote ID: {params.id}</p>
</div>
