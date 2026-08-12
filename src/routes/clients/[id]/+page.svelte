<script lang="ts">
  import PlusIcon from "phosphor-svelte/lib/Plus";
  import { page } from "$app/state";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import {
    billingPeriodLabels,
    formatAmount,
    monthlyEquivalentCents,
  } from "$lib/money";
  import {
    contractLifecycleLabels,
    projectLifecycleLabels,
  } from "$lib/lifecycle";
  import { deleteClientForm, getClient } from "../clients.remote";
  import { deleteContactForm } from "./contacts/contacts.remote";

  const client = $derived(await getClient(page.params.id!));
  const removeClient = $derived(deleteClientForm.for(client.id));

  const attached = $derived([
    [client.contacts.length, "contact"],
    [client.projects.length, "project"],
    [client.contracts.length, "contract"],
  ] as const);

  const deletedAlongside = $derived(
    new Intl.ListFormat("en-GB").format(
      attached
        .filter(([count]) => count > 0)
        .map(([count, noun]) => `${count} ${noun}${count === 1 ? "" : "s"}`),
    ),
  );
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/clients" class="text-muted-foreground text-sm">Clients</a>
  <div class="mt-2 flex items-baseline justify-between gap-4">
    <h1 class="text-xl font-medium">{client.name}</h1>
    <div class="flex items-center gap-2">
      <Button href="/clients/{client.id}/edit" variant="outline" size="sm"
        >Edit</Button
      >
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="ghost" size="sm">Delete</Button>
          {/snippet}
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete {client.name}?</AlertDialog.Title>
            <AlertDialog.Description>
              {#if deletedAlongside}
                This also deletes {deletedAlongside}. It cannot be undone.
              {:else}
                This cannot be undone.
              {/if}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <form {...removeClient}>
              <input {...removeClient.fields.id.as("hidden", client.id)} />
              <AlertDialog.Action
                type="submit"
                variant="destructive"
                disabled={removeClient.pending > 0}
                >Delete client</AlertDialog.Action
              >
            </form>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  </div>
  {#if client.notes}
    <p class="text-muted-foreground mt-2 text-sm whitespace-pre-line">
      {client.notes}
    </p>
  {/if}

  <section class="mt-10">
    <div class="flex items-baseline justify-between gap-4">
      <h2 class="text-sm font-medium">Contacts</h2>
      <Button
        href="/clients/{client.id}/contacts/new"
        variant="ghost"
        size="icon-sm"
        aria-label="Add contact"
      >
        <PlusIcon />
      </Button>
    </div>
    <ul class="mt-3 divide-y">
      {#each client.contacts as contact (contact.id)}
        {@const removeContact = deleteContactForm.for(contact.id)}
        <li class="group flex items-start justify-between gap-4 py-3 text-sm">
          <div>
            <span>{contact.name}</span>
            {#if contact.role}
              <span class="text-muted-foreground"> — {contact.role}</span>
            {/if}
            {#if contact.email}
              <p>
                <a
                  href="mailto:{contact.email}"
                  class="text-muted-foreground hover:underline"
                  >{contact.email}</a
                >
              </p>
            {/if}
            {#if contact.phone}
              <p>
                <a
                  href="tel:{contact.phone.replace(/[^+\d]/g, '')}"
                  class="text-muted-foreground hover:underline"
                  >{contact.phone}</a
                >
              </p>
            {/if}
          </div>
          <div
            class="flex shrink-0 items-center gap-1 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:hover)]:opacity-0"
          >
            <Button
              href="/clients/{client.id}/contacts/{contact.id}/edit"
              variant="ghost"
              size="sm">Edit</Button
            >
            <AlertDialog.Root>
              <AlertDialog.Trigger>
                {#snippet child({ props })}
                  <Button {...props} variant="ghost" size="sm">Delete</Button>
                {/snippet}
              </AlertDialog.Trigger>
              <AlertDialog.Content>
                <AlertDialog.Header>
                  <AlertDialog.Title>Delete {contact.name}?</AlertDialog.Title>
                  <AlertDialog.Description>
                    This cannot be undone. Contracts naming them stay, without a
                    contact.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                  <form {...removeContact}>
                    <input
                      {...removeContact.fields.id.as("hidden", contact.id)}
                    />
                    <input
                      {...removeContact.fields.clientId.as("hidden", client.id)}
                    />
                    <AlertDialog.Action
                      type="submit"
                      variant="destructive"
                      disabled={removeContact.pending > 0}
                      >Delete contact</AlertDialog.Action
                    >
                  </form>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog.Root>
          </div>
        </li>
      {:else}
        <li class="text-muted-foreground py-3 text-sm">No contacts yet.</li>
      {/each}
    </ul>
  </section>

  <section class="mt-10">
    <h2 class="text-sm font-medium">Projects</h2>
    <ul class="mt-3 divide-y">
      {#each client.projects as project (project.id)}
        <li class="flex items-baseline justify-between gap-4 py-3 text-sm">
          <a href="/projects/{project.id}" class="hover:underline"
            >{project.name}</a
          >
          <span class="text-muted-foreground"
            >{projectLifecycleLabels[project.lifecycle]}</span
          >
        </li>
      {:else}
        <li class="text-muted-foreground py-3 text-sm">No projects yet.</li>
      {/each}
    </ul>
  </section>

  <section class="mt-10">
    <h2 class="text-sm font-medium">Contracts</h2>
    <ul class="mt-3 divide-y">
      {#each client.contracts as contract (contract.id)}
        <li class="py-3 text-sm">
          <div class="flex items-baseline justify-between gap-4">
            <span>{contract.name}</span>
            <span class="text-muted-foreground">
              {contractLifecycleLabels[contract.lifecycle]}
            </span>
          </div>
          <p class="text-muted-foreground">
            {formatAmount(contract.amountCents)}
            {billingPeriodLabels[contract.billingPeriod]}
            · {formatAmount(
              monthlyEquivalentCents(
                contract.amountCents,
                contract.billingPeriod,
              ),
            )} per month
          </p>
          <p class="text-muted-foreground">Expires {contract.expiresOn}</p>
          {#if contract.project}
            <p class="text-muted-foreground">From {contract.project.name}</p>
          {/if}
          {#if contract.contact}
            <p class="text-muted-foreground">Via {contract.contact.name}</p>
          {/if}
        </li>
      {:else}
        <li class="text-muted-foreground py-3 text-sm">No contracts yet.</li>
      {/each}
    </ul>
  </section>
</main>
