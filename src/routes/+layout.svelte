<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { ModeWatcher } from "mode-watcher";
  import Header from "$lib/components/layout/Header.svelte";
  import Nav from "$lib/components/layout/Nav.svelte";

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />

<Header />

<Nav />

{@render children()}
