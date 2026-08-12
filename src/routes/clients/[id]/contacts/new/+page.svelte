<script lang="ts">
  import { page } from "$app/state";
  import ContactFields from "$lib/components/ContactFields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { getClient } from "../../../clients.remote";
  import { createContactForm } from "../contacts.remote";

  const client = $derived(await getClient(page.params.id!));
  const fields = createContactForm.fields;
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/clients/{client.id}" class="text-muted-foreground text-sm"
    >{client.name}</a
  >
  <h1 class="mt-2 text-xl font-medium">New contact</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    A human at {client.name} you communicate with.
  </p>

  <form {...createContactForm} class="mt-8 space-y-6">
    <input {...fields.clientId.as("hidden", client.id)} />

    <ContactFields
      name={fields.name}
      email={fields.email}
      phone={fields.phone}
      role={fields.role}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={createContactForm.pending > 0}
        >Create contact</Button
      >
      <Button variant="ghost" href="/clients/{client.id}">Cancel</Button>
    </div>
  </form>
</main>
