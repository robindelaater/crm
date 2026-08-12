<script lang="ts">
  import { page } from "$app/state";
  import ContactFields from "$lib/components/ContactFields.svelte";
  import { Button } from "$lib/components/ui/button";
  import { getContact, updateContactForm } from "../../contacts.remote";

  const contact = $derived(await getContact(page.params.contactId!));
  const editContact = $derived(updateContactForm.for(contact.id));
</script>

<main class="mx-auto max-w-lg px-6 py-16">
  <a href="/clients/{contact.clientId}" class="text-muted-foreground text-sm"
    >{contact.client.name}</a
  >
  <h1 class="mt-2 text-xl font-medium">Edit contact</h1>

  <form {...editContact} class="mt-8 space-y-6">
    <input {...editContact.fields.id.as("hidden", contact.id)} />
    <input {...editContact.fields.clientId.as("hidden", contact.clientId)} />

    <ContactFields
      name={editContact.fields.name}
      email={editContact.fields.email}
      phone={editContact.fields.phone}
      role={editContact.fields.role}
      values={{
        name: contact.name,
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        role: contact.role ?? "",
      }}
    />

    <div class="flex items-center gap-3">
      <Button type="submit" disabled={editContact.pending > 0}
        >Save changes</Button
      >
      <Button variant="ghost" href="/clients/{contact.clientId}">Cancel</Button>
    </div>
  </form>
</main>
