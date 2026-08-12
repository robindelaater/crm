<script lang="ts">
  import { page } from "$app/state";
  import SubscriptionFields from "$lib/components/SubscriptionFields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { formatAmountInput } from "$lib/money";
  import {
    getSubscription,
    updateSubscriptionForm,
  } from "../../subscriptions.remote";

  const subscription = $derived(await getSubscription(page.params.id!));
  const editSubscription = $derived(
    updateSubscriptionForm.for(subscription.id),
  );
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a
    href="/subscriptions/{subscription.id}"
    class="text-muted-foreground text-sm">{subscription.name}</a
  >
  <h1 class="mt-2 text-xl font-medium">Edit subscription</h1>

  <form {...editSubscription} class="mt-8 space-y-6">
    <input {...editSubscription.fields.id.as("hidden", subscription.id)} />

    <SubscriptionFields
      name={editSubscription.fields.name}
      vendor={editSubscription.fields.vendor}
      amountCents={editSubscription.fields.amountCents}
      billingPeriod={editSubscription.fields.billingPeriod}
      startedOn={editSubscription.fields.startedOn}
      notes={editSubscription.fields.notes}
      values={{
        name: subscription.name,
        vendor: subscription.vendor,
        amountCents: formatAmountInput(subscription.amountCents),
        billingPeriod: subscription.billingPeriod,
        startedOn: subscription.startedOn,
        notes: subscription.notes ?? "",
      }}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={editSubscription.pending > 0}
        >Save changes</Button
      >
      <Button variant="ghost" href="/subscriptions/{subscription.id}"
        >Cancel</Button
      >
    </div>
  </form>
</main>
