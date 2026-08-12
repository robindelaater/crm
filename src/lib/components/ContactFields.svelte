<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";

  let {
    name,
    email,
    phone,
    role,
    values = { name: "", email: "", phone: "", role: "" },
  }: {
    name: RemoteFormField<string>;
    email: RemoteFormField<string>;
    phone: RemoteFormField<string>;
    role: RemoteFormField<string>;
    values?: { name: string; email: string; phone: string; role: string };
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
  <Label for="role">Role</Label>
  <Input id="role" {...role.as("text", values.role)} autocomplete="off" />
</div>

<div class="space-y-2">
  <Label for="email">Email</Label>
  <Input id="email" {...email.as("text", values.email)} autocomplete="off" />
  {#each email.issues() ?? [] as issue (issue.message)}
    <p class="text-destructive text-sm">{issue.message}</p>
  {/each}
</div>

<div class="space-y-2">
  <Label for="phone">Phone</Label>
  <Input id="phone" {...phone.as("text", values.phone)} autocomplete="off" />
</div>
