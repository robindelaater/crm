import { getRequestEvent, query } from "$app/server";
import { and, asc, lte, ne } from "drizzle-orm";
import { getDb } from "$lib/server/db";
import { contract, project } from "$lib/server/db/schema";
import {
  attentionHorizon,
  projectLifecycle,
  today,
  withContractLifecycle,
  withProjectLifecycle,
} from "$lib/lifecycle";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const listContractsNeedingAttention = query(async () => {
  const on = today();

  const contracts = await db().query.contract.findMany({
    where: and(ne(contract.status, "cancelled"), lte(contract.expiresOn, attentionHorizon(on))),
    orderBy: asc(contract.expiresOn),
    with: { client: true },
  });

  return contracts.map((found) => withContractLifecycle(found, on));
});

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
