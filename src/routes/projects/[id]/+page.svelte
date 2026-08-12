<script lang="ts">
  import { page } from "$app/state";
  import DotsThreeIcon from "phosphor-svelte/lib/DotsThree";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { projectLifecycleLabels, today } from "$lib/lifecycle";
  import {
    cancelProjectForm,
    completeProjectForm,
    getProject,
  } from "../projects.remote";

  const project = $derived(await getProject(page.params.id!));
  const complete = $derived(completeProjectForm.for(project.id));
  const cancel = $derived(cancelProjectForm.for(project.id));

  const open = $derived(
    project.lifecycle !== "completed" && project.lifecycle !== "cancelled",
  );

  let completing = $state(false);
  let cancelling = $state(false);
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/projects" class="text-muted-foreground text-sm">Projects</a>
  <div class="mt-2 flex items-baseline justify-between gap-4">
    <h1 class="text-xl font-medium">{project.name}</h1>
    <div class="flex items-center gap-3">
      <span class="text-muted-foreground text-sm"
        >{projectLifecycleLabels[project.lifecycle]}</span
      >
      {#if open}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="ghost"
                size="icon"
                aria-label="Project actions"
              >
                <DotsThreeIcon class="size-5" weight="bold" />
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onSelect={() => (completing = true)}>
              Complete
            </DropdownMenu.Item>
            <DropdownMenu.Item
              variant="destructive"
              onSelect={() => (cancelling = true)}
            >
              Cancel
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {/if}
    </div>
  </div>
  <a
    href="/clients/{project.clientId}"
    class="text-muted-foreground mt-1 block text-sm hover:underline"
  >
    {project.client.name}
  </a>

  <dl class="mt-8 divide-y border-y text-sm">
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Started</dt>
      <dd>{project.startedOn ?? "Not scheduled"}</dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Completed</dt>
      <dd>{project.completedOn ?? "—"}</dd>
    </div>
  </dl>

  {#if project.notes}
    <p class="text-muted-foreground mt-6 text-sm whitespace-pre-line">
      {project.notes}
    </p>
  {/if}
</main>

<Dialog.Root bind:open={completing}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Complete {project.name}?</Dialog.Title>
      <Dialog.Description>
        A project is completed after the last invoice is paid.
      </Dialog.Description>
    </Dialog.Header>
    <form
      {...complete.enhance(async ({ submit }) => {
        if (await submit()) completing = false;
      })}
      class="space-y-2"
    >
      <input {...complete.fields.id.as("hidden", project.id)} />
      <Label for="completedOn">Completion date</Label>
      <Input
        id="completedOn"
        {...complete.fields.completedOn.as("date", today())}
      />
      {#each complete.fields.completedOn.issues() ?? [] as issue (issue.message)}
        <p class="text-destructive text-sm">{issue.message}</p>
      {/each}
      <Dialog.Footer class="pt-4">
        <Dialog.Close>
          {#snippet child({ props })}
            <Button {...props} variant="ghost">Back</Button>
          {/snippet}
        </Dialog.Close>
        <Button type="submit" disabled={complete.pending > 0}>
          Complete project
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={cancelling}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Cancel {project.name}?</AlertDialog.Title>
      <AlertDialog.Description>
        Cancelled means abandoned before delivery. It stays distinct from
        completed.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Keep it</AlertDialog.Cancel>
      <form
        {...cancel.enhance(async ({ submit }) => {
          if (await submit()) cancelling = false;
        })}
      >
        <input {...cancel.fields.id.as("hidden", project.id)} />
        <AlertDialog.Action
          type="submit"
          variant="destructive"
          disabled={cancel.pending > 0}>Cancel project</AlertDialog.Action
        >
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
