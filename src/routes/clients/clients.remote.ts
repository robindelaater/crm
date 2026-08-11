import { form, getRequestEvent, query } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import { asc } from "drizzle-orm";
import * as v from "valibot";
import { getDb } from "$lib/server/db";
import { client, contact, contract, project } from "$lib/server/db/schema";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const listClients = query(async () => db().select().from(client).orderBy(asc(client.name)));

export const getClient = query(v.string(), async (id) => {
  const found = await db().query.client.findFirst({
    where: (row, { eq }) => eq(row.id, id),
    with: {
      contacts: { orderBy: asc(contact.name) },
      projects: { orderBy: asc(project.name) },
      contracts: { orderBy: asc(contract.expiresOn), with: { project: true, contact: true } },
    },
  });

  if (!found) error(404, "Client not found");

  return found;
});

const newClient = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
  notes: v.pipe(
    v.string(),
    v.trim(),
    v.transform((value) => value || null),
  ),
});

export const createClientForm = form(newClient, async ({ name, notes }) => {
  await db().insert(client).values({ name, notes });

  await listClients().refresh();

  redirect(303, "/clients");
});
