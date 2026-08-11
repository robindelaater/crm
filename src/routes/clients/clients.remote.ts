import { form, getRequestEvent, query } from "$app/server";
import { redirect } from "@sveltejs/kit";
import { asc } from "drizzle-orm";
import * as v from "valibot";
import { getDb } from "$lib/server/db";
import { client } from "$lib/server/db/schema";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const listClients = query(async () => db().select().from(client).orderBy(asc(client.name)));

const newClient = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
  notes: v.pipe(
    v.string(),
    v.trim(),
    v.transform((value) => value || null),
  ),
});

export const createClient = form(newClient, async ({ name, notes }) => {
  await db().insert(client).values({ name, notes });

  await listClients().refresh();

  redirect(303, "/clients");
});
