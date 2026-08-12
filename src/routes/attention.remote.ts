import { getRequestEvent, query } from "$app/server";
import { asc, ne } from "drizzle-orm";
import { getDb } from "$lib/server/db";
import { project } from "$lib/server/db/schema";
import { listContractsNeedingAttention as findContractsNeedingAttention } from "$lib/server/attention";
import { projectLifecycle, today, withProjectLifecycle } from "$lib/lifecycle";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const listContractsNeedingAttention = query(() => findContractsNeedingAttention(db()));

export const listLiveProjects = query(async () => {
  const on = today();

  const projects = await db().query.project.findMany({
    where: ne(project.status, "cancelled"),
    orderBy: asc(project.startedOn),
    with: { client: true },
  });

  return projects
    .filter((found) => ["running", "scheduled"].includes(projectLifecycle(found, on)))
    .map((found) => withProjectLifecycle(found, on));
});
