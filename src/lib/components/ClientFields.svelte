<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";

  let {
    name,
    notes,
    values = { name: "", notes: "" },
  }: {
    name: RemoteFormField<string>;
    notes: RemoteFormField<string>;
    values?: { name: string; notes: string };
  } = $props();
</script>

<div class="space-y-2">
  <Label for="name">Name</Label>
  <Input id="name" {...name.as("text", values.name)} autocomplete="off" />
  {#each name.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="notes">Notes</Label>
  <Textarea id="notes" {...notes.as("text", values.notes)} rows={4} />
</div>
