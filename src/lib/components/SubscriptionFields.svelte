<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { billingPeriodLabels, billingPeriodOptions } from "$lib/money";
  import type { BillingPeriod } from "$lib/server/db/schema";

  let {
    name,
    vendor,
    amountCents,
    billingPeriod,
    startedOn,
    notes,
    values = {
      name: "",
      vendor: "",
      amountCents: "",
      billingPeriod: "monthly",
      startedOn: "",
      notes: "",
    },
  }: {
    name: RemoteFormField<string>;
    vendor: RemoteFormField<string>;
    amountCents: RemoteFormField<string>;
    billingPeriod: RemoteFormField<string>;
    startedOn: RemoteFormField<string>;
    notes: RemoteFormField<string>;
    values?: {
      name: string;
      vendor: string;
      amountCents: string;
      billingPeriod: BillingPeriod;
      startedOn: string;
      notes: string;
    };
  } = $props();

  const selectClasses =
    "border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none";
</script>

<div class="space-y-2">
  <Label for="name">Name</Label>
  <Input id="name" {...name.as("text", values.name)} autocomplete="off" />
  {#each name.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="vendor">Vendor</Label>
  <Input id="vendor" {...vendor.as("text", values.vendor)} autocomplete="off" />
  {#each vendor.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="amountCents">Amount</Label>
  <Input
    id="amountCents"
    {...amountCents.as("text", values.amountCents)}
    inputmode="decimal"
    placeholder="1250,00"
    autocomplete="off"
  />
  <p class="text-muted-foreground text-sm">Ex-VAT, in euros.</p>
  {#each amountCents.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="billingPeriod">Billing period</Label>
  <select
    id="billingPeriod"
    {...billingPeriod.as("select", values.billingPeriod)}
    class={selectClasses}
  >
    {#each billingPeriodOptions as period (period)}
      <option value={period}>{billingPeriodLabels[period]}</option>
    {/each}
  </select>
  {#each billingPeriod.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="startedOn">Start date</Label>
  <Input id="startedOn" {...startedOn.as("date", values.startedOn)} />
  {#each startedOn.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="notes">Notes</Label>
  <Textarea id="notes" {...notes.as("text", values.notes)} rows={4} />
</div>
