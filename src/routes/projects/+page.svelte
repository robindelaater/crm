<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { projectLifecycleLabels } from "$lib/lifecycle";
  import { listProjects } from "./projects.remote";

  let projects = $derived(await listProjects());
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <div class="flex items-baseline justify-between">
    <h1 class="text-xl font-medium">Projects</h1>
    <Button href="/projects/new" size="sm">New project</Button>
  </div>

  <ul class="mt-8 divide-y">
    {#each projects as project (project.id)}
      <li class="flex items-baseline justify-between gap-4 py-3 text-sm">
        <span>
          <a href="/projects/{project.id}" class="hover:underline"
            >{project.name}</a
          >
          <a
            href="/clients/{project.clientId}"
            class="text-muted-foreground hover:underline"
          >
            — {project.client.name}
          </a>
        </span>
        <span class="text-muted-foreground"
          >{projectLifecycleLabels[project.lifecycle]}</span
        >
      </li>
    {:else}
      <li class="text-muted-foreground py-3 text-sm">No projects yet.</li>
    {/each}
  </ul>
</main>
