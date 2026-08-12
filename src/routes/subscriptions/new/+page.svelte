<script lang="ts">
  import SubscriptionFields from "$lib/components/SubscriptionFields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { createSubscriptionForm } from "../subscriptions.remote";

  const fields = createSubscriptionForm.fields;
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <h1 class="text-xl font-medium">New subscription</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    A recurring cost you pay a vendor.
  </p>

  <form {...createSubscriptionForm} class="mt-8 space-y-6">
    <SubscriptionFields
      name={fields.name}
      vendor={fields.vendor}
      amountCents={fields.amountCents}
      billingPeriod={fields.billingPeriod}
      startedOn={fields.startedOn}
      notes={fields.notes}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={createSubscriptionForm.pending > 0}
        >Create subscription</Button
      >
      <Button variant="ghost" href="/subscriptions">Cancel</Button>
    </div>
  </form>
</main>
