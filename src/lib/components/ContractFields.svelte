<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { billingPeriodLabels, billingPeriodOptions } from "$lib/money";
  import type { BillingPeriod } from "$lib/server/db/schema";

  let {
    clientId,
    projectId,
    name,
    amountCents,
    billingPeriod,
    startsOn,
    expiresOn,
    notes,
    clients,
    projects,
    values = {
      clientId: "",
      projectId: "",
      name: "",
      amountCents: "",
      billingPeriod: "monthly",
      startsOn: "",
      expiresOn: "",
      notes: "",
    },
  }: {
    clientId: RemoteFormField<string>;
    projectId: RemoteFormField<string>;
    name: RemoteFormField<string>;
    amountCents: RemoteFormField<string>;
    billingPeriod: RemoteFormField<string>;
    startsOn: RemoteFormField<string>;
    expiresOn: RemoteFormField<string>;
    notes: RemoteFormField<string>;
    clients: { id: string; name: string }[];
    projects: { id: string; name: string; clientId: string }[];
    values?: {
      clientId: string;
      projectId: string;
      name: string;
      amountCents: string;
      billingPeriod: BillingPeriod;
      startsOn: string;
      expiresOn: string;
      notes: string;
    };
  } = $props();

  const selectable = $derived(
    projects.filter((project) => project.clientId === clientId.value()),
  );

  const selectClasses =
    "border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none";
</script>

<div class="space-y-2">
  <Label for="clientId">Client</Label>
  <select
    id="clientId"
    {...clientId.as("select", values.clientId)}
    class={selectClasses}
  >
    <option value="">Select a client</option>
    {#each clients as client (client.id)}
      <option value={client.id}>{client.name}</option>
    {/each}
  </select>
  {#each clientId.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="name">Name</Label>
  <Input id="name" {...name.as("text", values.name)} autocomplete="off" />
  {#each name.issues() ?? [] as issue (issue.message)}
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
  <Label for="startsOn">Start date</Label>
  <Input id="startsOn" {...startsOn.as("date", values.startsOn)} />
  {#each startsOn.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="expiresOn">Expiry date</Label>
  <Input id="expiresOn" {...expiresOn.as("date", values.expiresOn)} />
  {#each expiresOn.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="projectId">Project</Label>
  <select
    id="projectId"
    {...projectId.as("select", values.projectId)}
    class={selectClasses}
  >
    <option value="">None</option>
    {#each selectable as project (project.id)}
      <option value={project.id}>{project.name}</option>
    {/each}
  </select>
  <p class="text-muted-foreground text-sm">
    The project this contract grew out of, if there is one.
  </p>
</div>

<div class="space-y-2">
  <Label for="notes">Notes</Label>
  <Textarea id="notes" {...notes.as("text", values.notes)} rows={4} />
</div>
