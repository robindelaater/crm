import { form, getRequestEvent, query } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import { asc, eq } from "drizzle-orm";
import * as v from "valibot";
import { getDb } from "$lib/server/db";
import { client, contact, contract, project } from "$lib/server/db/schema";
import { today, withContractLifecycle, withProjectLifecycle } from "$lib/lifecycle";
import { getStats } from "../stats.remote";

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

  const on = today();

  return {
    ...found,
    projects: found.projects.map((project) => withProjectLifecycle(project, on)),
    contracts: found.contracts.map((contract) => withContractLifecycle(contract, on)),
  };
});

const clientDetails = {
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
  notes: v.pipe(
    v.string(),
    v.trim(),
    v.transform((value) => value || null),
  ),
};

export const createClientForm = form(v.object(clientDetails), async ({ name, notes }) => {
  await db().insert(client).values({ name, notes });

  await listClients().refresh();

  redirect(303, "/clients");
});

export const updateClientForm = form(
  v.object({ id: v.string(), ...clientDetails }),
  async ({ id, name, notes }) => {
    const updated = await db()
      .update(client)
      .set({ name, notes })
      .where(eq(client.id, id))
      .returning({ id: client.id });

    if (!updated.length) error(404, "Client not found");

    await getClient(id).refresh();
    await listClients().refresh();

    redirect(303, `/clients/${id}`);
  },
);

export const deleteClientForm = form(v.object({ id: v.string() }), async ({ id }) => {
  await db().delete(client).where(eq(client.id, id));

  await listClients().refresh();
  await getStats().refresh();

  redirect(303, "/clients");
});
