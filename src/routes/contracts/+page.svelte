<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { contractLifecycleLabels, isLive } from "$lib/lifecycle";
  import {
    billingPeriodLabels,
    formatAmount,
    monthlyEquivalentCents,
    totalMonthlyEquivalentCents,
  } from "$lib/money";
  import { listContracts } from "./contracts.remote";

  const contracts = $derived(await listContracts());

  const monthlyIn = $derived(
    totalMonthlyEquivalentCents(contracts.filter(isLive)),
  );
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <div class="flex items-baseline justify-between">
    <h1 class="text-xl font-medium">Contracts</h1>
    <Button href="/contracts/new" size="sm">New contract</Button>
  </div>

  <ul class="mt-8 divide-y">
    {#each contracts as contract (contract.id)}
      <li class="py-3 text-sm">
        <div class="flex items-baseline justify-between gap-4">
          <span>
            <a href="/contracts/{contract.id}" class="hover:underline"
              >{contract.name}</a
            >
            <a
              href="/clients/{contract.clientId}"
              class="text-muted-foreground hover:underline"
            >
              — {contract.client.name}
            </a>
          </span>
          <span class="text-muted-foreground">
            {contractLifecycleLabels[contract.lifecycle]}
          </span>
        </div>
        <p class="text-muted-foreground">
          {formatAmount(contract.amountCents)}
          {billingPeriodLabels[contract.billingPeriod]}
          · {formatAmount(
            monthlyEquivalentCents(
              contract.amountCents,
              contract.billingPeriod,
            ),
          )} per month
        </p>
        <p class="text-muted-foreground">Expires {contract.expiresOn}</p>
        {#if contract.project}
          <p class="text-muted-foreground">From {contract.project.name}</p>
        {/if}
      </li>
    {:else}
      <li class="text-muted-foreground py-3 text-sm">No contracts yet.</li>
    {/each}
  </ul>

  {#if contracts.some(isLive)}
    <p class="mt-6 flex items-baseline justify-between gap-4 text-sm">
      <span class="text-muted-foreground">Coming in per month</span>
      <span class="font-medium">{formatAmount(monthlyIn)}</span>
    </p>
  {/if}
</main>
