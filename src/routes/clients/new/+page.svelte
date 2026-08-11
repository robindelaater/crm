<script lang="ts">
  import ClientFields from "$lib/components/client-fields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { createClientForm } from "../clients.remote";
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <h1 class="text-xl font-medium">New client</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    The organisation that pays you.
  </p>

  <form {...createClientForm} class="mt-8 space-y-6">
    <ClientFields
      name={createClientForm.fields.name}
      notes={createClientForm.fields.notes}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={createClientForm.pending > 0}
        >Create client</Button
      >
      <Button variant="ghost" href="/clients">Cancel</Button>
    </div>
  </form>
</main>
