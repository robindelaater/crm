<script lang="ts">
  import { page } from "$app/state";
  import ContractFields from "$lib/components/ContractFields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { formatAmountInput } from "$lib/money";
  import { listClients } from "../../../clients/clients.remote";
  import { listProjects } from "../../../projects/projects.remote";
  import { getContract, updateContractForm } from "../../contracts.remote";

  const contract = $derived(await getContract(page.params.id!));
  const clients = $derived(await listClients());
  const projects = $derived(await listProjects());
  const editContract = $derived(updateContractForm.for(contract.id));
  const fields = $derived(editContract.fields);
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/contracts/{contract.id}" class="text-muted-foreground text-sm">
    {contract.name}
  </a>
  <h1 class="mt-2 text-xl font-medium">Edit contract</h1>

  <form {...editContract} class="mt-8 space-y-6">
    <input {...fields.id.as("hidden", contract.id)} />

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
        clientId: contract.clientId,
        projectId: contract.projectId ?? "",
        name: contract.name,
        amountCents: formatAmountInput(contract.amountCents),
        billingPeriod: contract.billingPeriod,
        startsOn: contract.startsOn,
        expiresOn: contract.expiresOn,
        notes: contract.notes ?? "",
      }}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={editContract.pending > 0}>
        Save changes
      </Button>
      <Button variant="ghost" href="/contracts/{contract.id}">Cancel</Button>
    </div>
  </form>
</main>
