import { form, getRequestEvent, query } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import { asc, eq } from "drizzle-orm";
import * as v from "valibot";
import { getDb } from "$lib/server/db";
import { project } from "$lib/server/db/schema";
import { today, withProjectLifecycle } from "$lib/lifecycle";
import { getClient } from "../clients/clients.remote";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const listProjects = query(async () => {
  const projects = await db().query.project.findMany({
    orderBy: asc(project.name),
    with: { client: true },
  });

  const on = today();

  return projects.map((project) => withProjectLifecycle(project, on));
});

export const getProject = query(v.string(), async (id) => {
  const found = await db().query.project.findFirst({
    where: (row, { eq }) => eq(row.id, id),
    with: { client: true },
  });

  if (!found) error(404, "Project not found");

  return withProjectLifecycle(found);
});

const optionalText = v.pipe(
  v.string(),
  v.trim(),
  v.transform((value) => value || null),
);

export const createProjectForm = form(
  v.object({
    clientId: v.pipe(v.string(), v.minLength(1, "Client is required")),
    name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
    startedOn: optionalText,
    notes: optionalText,
  }),
  async ({ clientId, name, startedOn, notes }) => {
    await db().insert(project).values({ clientId, name, startedOn, notes });

    await listProjects().refresh();
    await getClient(clientId).refresh();

    redirect(303, "/projects");
  },
);

const applyToProject = async (id: string, values: Partial<typeof project.$inferInsert>) => {
  const updated = await db()
    .update(project)
    .set(values)
    .where(eq(project.id, id))
    .returning({ clientId: project.clientId });

  const changed = updated[0];

  if (!changed) error(404, "Project not found");

  await getProject(id).refresh();
  await listProjects().refresh();
  await getClient(changed.clientId).refresh();
};

export const completeProjectForm = form(
  v.object({ id: v.string(), completedOn: v.pipe(v.string(), v.isoDate()) }),
  async ({ id, completedOn }) => {
    await applyToProject(id, { completedOn });
  },
);

export const cancelProjectForm = form(v.object({ id: v.string() }), async ({ id }) => {
  await applyToProject(id, { status: "cancelled" });
});
