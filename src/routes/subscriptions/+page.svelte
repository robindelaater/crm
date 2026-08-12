<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    billingPeriodLabels,
    formatAmount,
    monthlyEquivalentCents,
    totalMonthlyEquivalentCents,
  } from "$lib/money";
  import { listSubscriptions } from "./subscriptions.remote";

  const subscriptions = $derived(await listSubscriptions());

  const active = $derived(subscriptions.filter((s) => s.status === "active"));

  const monthlyOut = $derived(totalMonthlyEquivalentCents(active));
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <div class="flex items-baseline justify-between">
    <h1 class="text-xl font-medium">Subscriptions</h1>
    <Button href="/subscriptions/new" size="sm">New subscription</Button>
  </div>

  <ul class="mt-8 divide-y">
    {#each subscriptions as subscription (subscription.id)}
      <li class="py-3 text-sm">
        <div class="flex items-baseline justify-between gap-4">
          <span>
            <a href="/subscriptions/{subscription.id}" class="hover:underline"
              >{subscription.name}</a
            >
            <span class="text-muted-foreground">— {subscription.vendor}</span>
          </span>
        </div>
        <p class="text-muted-foreground">
          {formatAmount(subscription.amountCents)}
          {billingPeriodLabels[subscription.billingPeriod]}
          · {formatAmount(
            monthlyEquivalentCents(
              subscription.amountCents,
              subscription.billingPeriod,
            ),
          )} per month
        </p>
      </li>
    {:else}
      <li class="text-muted-foreground py-3 text-sm">No subscriptions yet.</li>
    {/each}
  </ul>

  {#if active.length > 0}
    <p class="mt-6 flex items-baseline justify-between gap-4 text-sm">
      <span class="text-muted-foreground">Going out per month</span>
      <span class="font-medium">{formatAmount(monthlyOut)}</span>
    </p>
  {/if}
</main>
