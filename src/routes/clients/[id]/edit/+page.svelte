<script lang="ts">
  import { page } from "$app/state";
  import ClientFields from "$lib/components/ClientFields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { getClient, updateClientForm } from "../../clients.remote";

  const client = $derived(await getClient(page.params.id!));
  const editClient = $derived(updateClientForm.for(client.id));
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/clients/{client.id}" class="text-muted-foreground text-sm"
    >{client.name}</a
  >
  <h1 class="mt-2 text-xl font-medium">Edit client</h1>

  <form {...editClient} class="mt-8 space-y-6">
    <input {...editClient.fields.id.as("hidden", client.id)} />

    <ClientFields
      name={editClient.fields.name}
      notes={editClient.fields.notes}
      values={{ name: client.name, notes: client.notes ?? "" }}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={editClient.pending > 0}
        >Save changes</Button
      >
      <Button variant="ghost" href="/clients/{client.id}">Cancel</Button>
    </div>
  </form>
</main>
