<script lang="ts">
  import ContractFields from "$lib/components/ContractFields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { listClients } from "../../clients/clients.remote";
  import { listProjects } from "../../projects/projects.remote";
  import { createContractForm } from "../contracts.remote";

  const clients = $derived(await listClients());
  const projects = $derived(await listProjects());
  const fields = createContractForm.fields;
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <h1 class="text-xl font-medium">New contract</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    A recurring service agreement with a client, until it expires or is renewed.
  </p>

  <form {...createContractForm} class="mt-8 space-y-6">
    <ContractFields
      clientId={fields.clientId}
      projectId={fields.projectId}
      name={fields.name}
      amountCents={fields.amountCents}
      billingPeriod={fields.billingPeriod}
      startsOn={fields.startsOn}
      expiresOn={fields.expiresOn}
      notes={fields.notes}
      {clients}
      {projects}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={createContractForm.pending > 0}
        >Create contract</Button
      >
      <Button variant="ghost" href="/contracts">Cancel</Button>
    </div>
  </form>
</main>
