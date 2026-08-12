<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { listClients } from "../../clients/clients.remote";
  import { createProjectForm } from "../projects.remote";

  const clients = $derived(await listClients());
  const fields = createProjectForm.fields;
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <h1 class="text-xl font-medium">New project</h1>
  <p class="text-muted-foreground mt-1 text-sm">
    A piece of work for a client that has an end.
  </p>

  <form {...createProjectForm} class="mt-8 space-y-6">
    <div class="space-y-2">
      <Label for="clientId">Client</Label>
      <select
        id="clientId"
        {...fields.clientId.as("select")}
        class="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none"
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
      <Label for="startedOn">Start date</Label>
      <Input id="startedOn" {...fields.startedOn.as("date")} />
      <p class="text-muted-foreground text-sm">
        Leave empty while the project is unscheduled.
      </p>
    </div>

    <div class="space-y-2">
      <Label for="notes">Notes</Label>
      <Textarea id="notes" {...fields.notes.as("text")} rows={4} />
    </div>

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={createProjectForm.pending > 0}
        >Create project</Button
      >
      <Button variant="ghost" href="/projects">Cancel</Button>
    </div>
  </form>
</main>
