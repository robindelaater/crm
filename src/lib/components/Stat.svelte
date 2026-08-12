<script lang="ts">
  import { browser } from "$app/environment";
  import NumberFlow from "@number-flow/svelte";

  type Props = {
    label: string;
    value: number;
    format?: Intl.NumberFormatOptions;
  };

  const { label, value, format }: Props = $props();

  const formatted = $derived(
    new Intl.NumberFormat("nl-NL", format).format(value),
  );
</script>

<div class="rounded-lg border px-4 py-3">
  <p class="text-muted-foreground text-sm">{label}</p>
  <p class="mt-1 text-2xl font-medium tabular-nums">
    {#if browser}
      <NumberFlow {value} locales="nl-NL" {format} />
    {:else}
      {formatted}
    {/if}
  </p>
</div>
