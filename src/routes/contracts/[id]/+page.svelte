<script lang="ts">
  import { page } from "$app/state";
  import DotsThreeIcon from "phosphor-svelte/lib/DotsThree";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { contractLifecycleLabels, isLive, isRenewable } from "$lib/lifecycle";
  import {
    billingPeriodLabels,
    formatAmount,
    monthlyEquivalentCents,
  } from "$lib/money";
  import {
    cancelContractForm,
    getContract,
    nonRenewContractForm,
  } from "../contracts.remote";

  const contract = $derived(await getContract(page.params.id!));
  const nonRenew = $derived(nonRenewContractForm.for(contract.id));
  const cancel = $derived(cancelContractForm.for(contract.id));

  const live = $derived(isLive(contract));

  let nonRenewing = $state(false);
  let cancelling = $state(false);
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/contracts" class="text-muted-foreground text-sm">Contracts</a>
  <div class="mt-2 flex items-baseline justify-between gap-4">
    <h1 class="text-xl font-medium">{contract.name}</h1>
    <div class="flex items-center gap-3">
      <span class="text-muted-foreground text-sm">
        {contractLifecycleLabels[contract.lifecycle]}
      </span>
      <Button href="/contracts/{contract.id}/edit" variant="outline" size="sm">
        Edit
      </Button>
      {#if isRenewable(contract)}
        <Button href="/contracts/{contract.id}/renew" size="sm">Renew</Button>
      {/if}
      {#if live}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="ghost"
                size="icon"
                aria-label="Contract actions"
              >
                <DotsThreeIcon class="size-5" weight="bold" />
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            {#if contract.lifecycle === "active"}
              <DropdownMenu.Item onSelect={() => (nonRenewing = true)}>
                Non-renew
              </DropdownMenu.Item>
            {/if}
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
    href="/clients/{contract.clientId}"
    class="text-muted-foreground mt-1 block text-sm hover:underline"
  >
    {contract.client.name}
  </a>

  <dl class="mt-8 divide-y border-y text-sm">
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Amount</dt>
      <dd>
        {formatAmount(contract.amountCents)}
        {billingPeriodLabels[contract.billingPeriod]}
      </dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Monthly equivalent</dt>
      <dd>
        {formatAmount(
          monthlyEquivalentCents(contract.amountCents, contract.billingPeriod),
        )}
      </dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Starts</dt>
      <dd>{contract.startsOn}</dd>
    </div>
    <div class="flex items-baseline justify-between gap-4 py-3">
      <dt class="text-muted-foreground">Expires</dt>
      <dd>{contract.expiresOn}</dd>
    </div>
    {#if contract.project}
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted-foreground">Project</dt>
        <dd>
          <a href="/projects/{contract.project.id}" class="hover:underline">
            {contract.project.name}
          </a>
        </dd>
      </div>
    {/if}
    {#if contract.contact}
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted-foreground">Contact</dt>
        <dd>{contract.contact.name}</dd>
      </div>
    {/if}
    {#each contract.renewals as renewal (renewal.id)}
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted-foreground">Renewed by</dt>
        <dd>
          <a href="/contracts/{renewal.id}" class="hover:underline">
            {renewal.name}
          </a>
        </dd>
      </div>
    {/each}
    {#if contract.renewalOf}
      <div class="flex items-baseline justify-between gap-4 py-3">
        <dt class="text-muted-foreground">Renewal of</dt>
        <dd>
          <a href="/contracts/{contract.renewalOf.id}" class="hover:underline">
            {contract.renewalOf.name}
          </a>
        </dd>
      </div>
    {/if}
  </dl>

  {#if contract.notes}
    <p class="text-muted-foreground mt-6 text-sm whitespace-pre-line">
      {contract.notes}
    </p>
  {/if}
</main>

<AlertDialog.Root bind:open={nonRenewing}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Let {contract.name} expire?</AlertDialog.Title>
      <AlertDialog.Description>
        It runs to {contract.expiresOn} without a renewal, and keeps serving the client
        until then.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Keep it up for renewal</AlertDialog.Cancel>
      <form
        {...nonRenew.enhance(async ({ submit }) => {
          if (await submit()) nonRenewing = false;
        })}
      >
        <input {...nonRenew.fields.id.as("hidden", contract.id)} />
        <AlertDialog.Action type="submit" disabled={nonRenew.pending > 0}>
          Non-renew contract
        </AlertDialog.Action>
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={cancelling}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Cancel {contract.name}?</AlertDialog.Title>
      <AlertDialog.Description>
        Cancelled means ended before {contract.expiresOn}. To let it run out
        instead, non-renew it.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Keep it</AlertDialog.Cancel>
      <form
        {...cancel.enhance(async ({ submit }) => {
          if (await submit()) cancelling = false;
        })}
      >
        <input {...cancel.fields.id.as("hidden", contract.id)} />
        <AlertDialog.Action
          type="submit"
          variant="destructive"
          disabled={cancel.pending > 0}>Cancel contract</AlertDialog.Action
        >
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
