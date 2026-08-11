<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { listClients } from './clients.remote';

	const clients = $derived(await listClients());
</script>

<main class="mx-auto max-w-lg px-6 py-16">
	<div class="flex items-baseline justify-between">
		<h1 class="text-xl font-medium">Clients</h1>
		<Button href="/clients/new" size="sm">New client</Button>
	</div>

	<ul class="mt-8 divide-y">
		{#each clients as client (client.id)}
			<li class="py-3 text-sm">
				<a href="/clients/{client.id}" class="hover:underline">{client.name}</a>
			</li>
		{:else}
			<li class="text-muted-foreground py-3 text-sm">No clients yet.</li>
		{/each}
	</ul>
</main>
