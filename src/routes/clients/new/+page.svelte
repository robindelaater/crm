<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createClient } from '../clients.remote';

	const name = $derived(createClient.fields.name);
	const notes = $derived(createClient.fields.notes);
</script>

<main class="mx-auto max-w-lg px-6 py-16">
	<h1 class="text-xl font-medium">New client</h1>
	<p class="text-muted-foreground mt-1 text-sm">The organisation that pays you.</p>

	<form {...createClient} class="mt-8 space-y-6">
		<div class="space-y-2">
			<Label for="name">Name</Label>
			<Input id="name" {...name.as('text')} autocomplete="off" />
			{#each name.issues() ?? [] as issue (issue.message)}
				<p class="text-destructive text-sm">{issue.message}</p>
			{/each}
		</div>

		<div class="space-y-2">
			<Label for="notes">Notes</Label>
			<Textarea id="notes" {...notes.as('text')} rows={4} />
		</div>

		<div class="flex items-center gap-3">
			<Button type="submit" disabled={createClient.pending > 0}>Create client</Button>
			<Button variant="ghost" href="/clients">Cancel</Button>
		</div>
	</form>
</main>
