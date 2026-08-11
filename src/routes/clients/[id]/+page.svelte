<script lang="ts">
	import { page } from '$app/state';
	import { billingPeriodLabels, formatAmount, monthlyEquivalentCents } from '$lib/money';
	import {
		contractState,
		contractStateLabels,
		projectState,
		projectStateLabels
	} from '$lib/state';
	import { getClient } from '../clients.remote';

	const client = $derived(await getClient(page.params.id!));
</script>

<main class="mx-auto max-w-lg px-6 py-16">
	<a href="/clients" class="text-muted-foreground text-sm">Clients</a>
	<h1 class="mt-2 text-xl font-medium">{client.name}</h1>
	{#if client.notes}
		<p class="text-muted-foreground mt-2 text-sm whitespace-pre-line">{client.notes}</p>
	{/if}

	<section class="mt-10">
		<h2 class="text-sm font-medium">Contacts</h2>
		<ul class="mt-3 divide-y">
			{#each client.contacts as contact (contact.id)}
				<li class="py-3 text-sm">
					<span>{contact.name}</span>
					{#if contact.role}
						<span class="text-muted-foreground"> — {contact.role}</span>
					{/if}
					{#if contact.email}
						<p class="text-muted-foreground">{contact.email}</p>
					{/if}
					{#if contact.phone}
						<p class="text-muted-foreground">{contact.phone}</p>
					{/if}
				</li>
			{:else}
				<li class="text-muted-foreground py-3 text-sm">No contacts yet.</li>
			{/each}
		</ul>
	</section>

	<section class="mt-10">
		<h2 class="text-sm font-medium">Projects</h2>
		<ul class="mt-3 divide-y">
			{#each client.projects as project (project.id)}
				<li class="flex items-baseline justify-between gap-4 py-3 text-sm">
					<span>{project.name}</span>
					<span class="text-muted-foreground">{projectStateLabels[projectState(project)]}</span>
				</li>
			{:else}
				<li class="text-muted-foreground py-3 text-sm">No projects yet.</li>
			{/each}
		</ul>
	</section>

	<section class="mt-10">
		<h2 class="text-sm font-medium">Contracts</h2>
		<ul class="mt-3 divide-y">
			{#each client.contracts as contract (contract.id)}
				<li class="py-3 text-sm">
					<div class="flex items-baseline justify-between gap-4">
						<span>{contract.name}</span>
						<span class="text-muted-foreground">
							{contractStateLabels[contractState(contract)]}
						</span>
					</div>
					<p class="text-muted-foreground">
						{formatAmount(contract.amountCents)}
						{billingPeriodLabels[contract.billingPeriod]}
						· {formatAmount(monthlyEquivalentCents(contract.amountCents, contract.billingPeriod))} per
						month
					</p>
					<p class="text-muted-foreground">Expires {contract.expiresOn}</p>
					{#if contract.project}
						<p class="text-muted-foreground">From {contract.project.name}</p>
					{/if}
					{#if contract.contact}
						<p class="text-muted-foreground">Via {contract.contact.name}</p>
					{/if}
				</li>
			{:else}
				<li class="text-muted-foreground py-3 text-sm">No contracts yet.</li>
			{/each}
		</ul>
	</section>
</main>
