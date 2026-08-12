<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import { contractLifecycleLabels } from "$lib/lifecycle";
  import {
    billingPeriodLabels,
    formatAmount,
    monthlyEquivalentCents,
  } from "$lib/money";
  import { getContract } from "../contracts.remote";

  const contract = $derived(await getContract(page.params.id!));
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/contracts" class="text-muted-foreground text-sm">Contracts</a>
  <div class="mt-2 flex items-baseline justify-between gap-4">
    <h1 class="text-xl font-medium">{contract.name}</h1>
    <div class="flex items-center gap-3">
      <span class="text-muted-foreground text-sm">
        {contractLifecycleLabels[contract.lifecycle]}
      </span>
      <Button href="/contracts/{contract.id}/edit" variant="outline" size="sm">
        Edit
      </Button>
    </div>
  </div>
  <a
    href="/clients/{contract.clientId}"
    class="text-muted-foreground mt-1 block text-sm hover:underline"
  >
    {contract.client.name}
  </a>

  <dl class="mt-8 divide-y border-y text-sm">
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Amount</dt>
      <dd>
        {formatAmount(contract.amountCents)}
        {billingPeriodLabels[contract.billingPeriod]}
      </dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Monthly equivalent</dt>
      <dd>
        {formatAmount(
          monthlyEquivalentCents(contract.amountCents, contract.billingPeriod),
        )}
      </dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Starts</dt>
      <dd>{contract.startsOn}</dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Expires</dt>
      <dd>{contract.expiresOn}</dd>
    </div>
    {#if contract.project}
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted-foreground">Project</dt>
        <dd>
          <a href="/projects/{contract.project.id}" class="hover:underline">
            {contract.project.name}
          </a>
        </dd>
      </div>
    {/if}
    {#if contract.contact}
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted-foreground">Contact</dt>
        <dd>{contract.contact.name}</dd>
      </div>
    {/if}
    {#if contract.renewalOf}
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted-foreground">Renewal of</dt>
        <dd>
          <a href="/contracts/{contract.renewalOf.id}" class="hover:underline">
            {contract.renewalOf.name}
          </a>
        </dd>
      </div>
    {/if}
  </dl>

  {#if contract.notes}
    <p class="text-muted-foreground mt-6 text-sm whitespace-pre-line">
      {contract.notes}
    </p>
  {/if}
</main>
