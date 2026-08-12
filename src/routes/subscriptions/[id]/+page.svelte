<script lang="ts">
  import { page } from "$app/state";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import {
    billingPeriodLabels,
    formatAmount,
    monthlyEquivalentCents,
  } from "$lib/money";
  import {
    deleteSubscriptionForm,
    getSubscription,
  } from "../subscriptions.remote";

  const subscription = $derived(await getSubscription(page.params.id!));
  const removeSubscription = $derived(
    deleteSubscriptionForm.for(subscription.id),
  );
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/subscriptions" class="text-muted-foreground text-sm"
    >Subscriptions</a
  >
  <div class="mt-2 flex items-baseline justify-between gap-4">
    <h1 class="text-xl font-medium">{subscription.name}</h1>
    <div class="flex items-center gap-2">
      <Button
        href="/subscriptions/{subscription.id}/edit"
        variant="outline"
        size="sm"
      >
        Edit
      </Button>
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="ghost" size="sm">Delete</Button>
          {/snippet}
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete {subscription.name}?</AlertDialog.Title>
            <AlertDialog.Description>
              This cannot be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <form {...removeSubscription}>
              <input
                {...removeSubscription.fields.id.as("hidden", subscription.id)}
              />
              <AlertDialog.Action
                type="submit"
                variant="destructive"
                disabled={removeSubscription.pending > 0}
                >Delete subscription</AlertDialog.Action
              >
            </form>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  </div>
  <p class="text-muted-foreground mt-1 text-sm">{subscription.vendor}</p>

  <dl class="mt-8 divide-y border-y text-sm">
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Amount</dt>
      <dd>
        {formatAmount(subscription.amountCents)}
        {billingPeriodLabels[subscription.billingPeriod]}
      </dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Monthly equivalent</dt>
      <dd>
        {formatAmount(
          monthlyEquivalentCents(
            subscription.amountCents,
            subscription.billingPeriod,
          ),
        )}
      </dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Started</dt>
      <dd>{subscription.startedOn}</dd>
    </div>
  </dl>

  {#if subscription.notes}
    <p class="text-muted-foreground mt-6 text-sm whitespace-pre-line">
      {subscription.notes}
    </p>
  {/if}
</main>
