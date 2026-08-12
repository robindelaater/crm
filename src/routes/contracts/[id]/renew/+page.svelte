<script lang="ts">
  import { page } from "$app/state";
  import ContractFields from "$lib/components/ContractFields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { renewalTerm } from "$lib/lifecycle";
  import { formatAmountInput } from "$lib/money";
  import { listClients } from "../../../clients/clients.remote";
  import { listProjects } from "../../../projects/projects.remote";
  import { getContract, renewContractForm } from "../../contracts.remote";

  const predecessor = $derived(await getContract(page.params.id!));
  const clients = $derived(await listClients());
  const projects = $derived(await listProjects());
  const renewal = $derived(renewContractForm.for(predecessor.id));
  const fields = $derived(renewal.fields);
  const term = $derived(renewalTerm(predecessor));
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/contracts/{predecessor.id}" class="text-muted-foreground text-sm">
    {predecessor.name}
  </a>
  <h1 class="mt-2 text-xl font-medium">Renew contract</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    A new contract succeeding this one, on freshly agreed terms. The old one is
    left to expire on {predecessor.expiresOn}.
  </p>

  <form {...renewal} class="mt-8 space-y-6">
    <input {...fields.renewalOfId.as("hidden", predecessor.id)} />

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
      values={{
        clientId: predecessor.clientId,
        projectId: predecessor.projectId ?? "",
        name: predecessor.name,
        amountCents: formatAmountInput(predecessor.amountCents),
        billingPeriod: predecessor.billingPeriod,
        startsOn: term.startsOn,
        expiresOn: term.expiresOn,
        notes: predecessor.notes ?? "",
      }}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={renewal.pending > 0}>
        Create renewal
      </Button>
      <Button variant="ghost" href="/contracts/{predecessor.id}">Cancel</Button>
    </div>
  </form>
</main>
