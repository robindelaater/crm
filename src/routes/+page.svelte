<script lang="ts">
  import {
    attentionWindowDays,
    contractLifecycleLabels,
    projectLifecycleLabels,
  } from "$lib/lifecycle";
  import Stat from "$lib/components/Stat.svelte";
  import { formatAmount, monthlyEquivalentCents } from "$lib/money";
  import {
    listContractsNeedingAttention,
    listLiveProjects,
  } from "./attention.remote";
  import { getStats } from "./stats.remote";

  const contracts = $derived(await listContractsNeedingAttention());

  const stats = $derived(await getStats());

  const euros = { style: "currency", currency: "EUR" } as const;

  const expiry = (days: number) => {
    if (days < 0) return `Expired ${-days} ${-days === 1 ? "day" : "days"} ago`;
    if (days === 0) return "Expires today";
    return `Expires in ${days} ${days === 1 ? "day" : "days"}`;
  };
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <h1 class="text-xl font-medium">Needs attention</h1>

  <div class="mt-8 grid grid-cols-2 gap-3">
    <Stat label="Projects running" value={stats.runningProjects} />
    <Stat label="Contracts live" value={stats.liveContracts} />
    <Stat
      label="In per month"
      value={stats.monthlyInCents / 100}
      format={euros}
    />
    <Stat
      label="Out per month"
      value={stats.monthlyOutCents / 100}
      format={euros}
    />
  </div>

  {#if contracts.length === 0}
    <p class="text-muted-foreground mt-8 text-sm">
      Nothing expires in the next {attentionWindowDays} days.
    </p>

    <h2 class="mt-12 text-sm font-medium">Projects</h2>

    <ul class="mt-4 divide-y">
      {#each await listLiveProjects() as project (project.id)}
        <li class="flex items-baseline justify-between gap-4 py-3 text-sm">
          <span>
            <a href="/projects/{project.id}" class="hover:underline"
              >{project.name}</a
            >
            <a
              href="/clients/{project.clientId}"
              class="text-muted-foreground hover:underline"
            >
              — {project.client.name}
            </a>
          </span>
          <span class="text-muted-foreground">
            {projectLifecycleLabels[project.lifecycle]}
          </span>
        </li>
      {:else}
        <li class="text-muted-foreground py-3 text-sm">
          No projects running or scheduled.
        </li>
      {/each}
    </ul>
  {:else}
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
            {expiry(contract.daysUntilExpiry)} · {contract.expiresOn}
          </p>
          <p class="text-muted-foreground">
            {formatAmount(
              monthlyEquivalentCents(
                contract.amountCents,
                contract.billingPeriod,
              ),
            )} per month
          </p>
        </li>
      {/each}
    </ul>
  {/if}
</main>
