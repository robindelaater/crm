<script lang="ts">
  import Moon from "phosphor-svelte/lib/Moon";
  import Sun from "phosphor-svelte/lib/Sun";
  import { toggleMode } from "mode-watcher";
  import { Button } from "$lib/components/ui/button";
</script>

<Button
  onclick={toggleMode}
  variant="ghost"
  size="icon"
  aria-label="Toggle theme"
>
  <Sun class="size-4 dark:hidden" />
  <Moon class="hidden size-4 dark:block" />
</Button>
