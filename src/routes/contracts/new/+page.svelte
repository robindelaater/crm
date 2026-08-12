<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { billingPeriodLabels, billingPeriodOptions } from "$lib/money";
  import { listClients } from "../../clients/clients.remote";
  import { listProjects } from "../../projects/projects.remote";
  import { createContractForm } from "../contracts.remote";

  const clients = $derived(await listClients());
  const projects = $derived(await listProjects());
  const fields = createContractForm.fields;

  const selectable = $derived(
    projects.filter((project) => project.clientId === fields.clientId.value()),
  );

  const selectClasses =
    "border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none";
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <h1 class="text-xl font-medium">New contract</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    A recurring service agreement with a client, until it expires or is renewed.
  </p>

  <form {...createContractForm} class="mt-8 space-y-6">
    <div class="space-y-2">
      <Label for="clientId">Client</Label>
      <select
        id="clientId"
        {...fields.clientId.as("select")}
        class={selectClasses}
      >
        <option value="">Select a client</option>
        {#each clients as client (client.id)}
          <option value={client.id}>{client.name}</option>
        {/each}
      </select>
      {#each fields.clientId.issues() ?? [] as issue (issue.message)}
        <p class="text-destructive text-sm">{issue.message}</p>
      {/each}
    </div>

    <div class="space-y-2">
      <Label for="name">Name</Label>
      <Input id="name" {...fields.name.as("text")} autocomplete="off" />
      {#each fields.name.issues() ?? [] as issue (issue.message)}
        <p class="text-destructive text-sm">{issue.message}</p>
      {/each}
    </div>

    <div class="space-y-2">
      <Label for="amountCents">Amount</Label>
      <Input
        id="amountCents"
        {...fields.amountCents.as("text")}
        inputmode="decimal"
        placeholder="1250,00"
        autocomplete="off"
      />
      <p class="text-muted-foreground text-sm">Ex-VAT, in euros.</p>
      {#each fields.amountCents.issues() ?? [] as issue (issue.message)}
        <p class="text-destructive text-sm">{issue.message}</p>
      {/each}
    </div>

    <div class="space-y-2">
      <Label for="billingPeriod">Billing period</Label>
      <select
        id="billingPeriod"
        {...fields.billingPeriod.as("select")}
        class={selectClasses}
      >
        {#each billingPeriodOptions as period (period)}
          <option value={period}>{billingPeriodLabels[period]}</option>
        {/each}
      </select>
      {#each fields.billingPeriod.issues() ?? [] as issue (issue.message)}
        <p class="text-destructive text-sm">{issue.message}</p>
      {/each}
    </div>

    <div class="space-y-2">
      <Label for="startsOn">Start date</Label>
      <Input id="startsOn" {...fields.startsOn.as("date")} />
      {#each fields.startsOn.issues() ?? [] as issue (issue.message)}
        <p class="text-destructive text-sm">{issue.message}</p>
      {/each}
    </div>

    <div class="space-y-2">
      <Label for="expiresOn">Expiry date</Label>
      <Input id="expiresOn" {...fields.expiresOn.as("date")} />
      {#each fields.expiresOn.issues() ?? [] as issue (issue.message)}
        <p class="text-destructive text-sm">{issue.message}</p>
      {/each}
    </div>

    <div class="space-y-2">
      <Label for="projectId">Project</Label>
      <select
        id="projectId"
        {...fields.projectId.as("select")}
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
      <Textarea id="notes" {...fields.notes.as("text")} rows={4} />
    </div>

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={createContractForm.pending > 0}
        >Create contract</Button
      >
      <Button variant="ghost" href="/contracts">Cancel</Button>
    </div>
  </form>
</main>
