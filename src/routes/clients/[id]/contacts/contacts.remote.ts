import { form, getRequestEvent, query } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import { getDb } from "$lib/server/db";
import { contact } from "$lib/server/db/schema";
import { getClient } from "../../clients.remote";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const getContact = query(v.string(), async (id) => {
  const found = await db().query.contact.findFirst({
    where: (row, { eq }) => eq(row.id, id),
    with: { client: true },
  });

  if (!found) error(404, "Contact not found");

  return found;
});

const optionalText = v.pipe(
  v.string(),
  v.trim(),
  v.transform((value) => value || null),
);

const contactDetails = {
  clientId: v.string(),
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
  email: v.union([
    v.pipe(
      v.literal(""),
      v.transform(() => null),
    ),
    v.pipe(v.string(), v.trim(), v.email("Enter a valid email address")),
  ]),
  phone: optionalText,
  role: optionalText,
};

export const createContactForm = form(
  v.object(contactDetails),
  async ({ clientId, ...details }) => {
    await db()
      .insert(contact)
      .values({ clientId, ...details });

    await getClient(clientId).refresh();

    redirect(303, `/clients/${clientId}`);
  },
);

export const updateContactForm = form(
  v.object({ id: v.string(), ...contactDetails }),
  async ({ id, clientId, ...details }) => {
    const updated = await db()
      .update(contact)
      .set(details)
      .where(eq(contact.id, id))
      .returning({ id: contact.id });

    if (!updated.length) error(404, "Contact not found");

    await getContact(id).refresh();
    await getClient(clientId).refresh();

    redirect(303, `/clients/${clientId}`);
  },
);

export const deleteContactForm = form(
  v.object({ id: v.string(), clientId: v.string() }),
  async ({ id, clientId }) => {
    await db().delete(contact).where(eq(contact.id, id));

    await getClient(clientId).refresh();

    redirect(303, `/clients/${clientId}`);
  },
);
