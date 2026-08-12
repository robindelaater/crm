import { getRequestEvent, query } from "$app/server";
import { ne } from "drizzle-orm";
import { getDb } from "$lib/server/db";
import { contract, project, subscription } from "$lib/server/db/schema";
import { isLive, projectLifecycle, today, withContractLifecycle } from "$lib/lifecycle";
import { totalMonthlyEquivalentCents } from "$lib/money";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const getStats = query(async () => {
  const on = today();

  const [projects, contracts, subscriptions] = await Promise.all([
    db().select().from(project).where(ne(project.status, "cancelled")),
    db().select().from(contract).where(ne(contract.status, "cancelled")),
    db().select().from(subscription).where(ne(subscription.status, "cancelled")),
  ]);

  const live = contracts.map((found) => withContractLifecycle(found, on)).filter(isLive);

  return {
    runningProjects: projects.filter((found) => projectLifecycle(found, on) === "running").length,
    liveContracts: live.length,
    monthlyInCents: totalMonthlyEquivalentCents(live),
    monthlyOutCents: totalMonthlyEquivalentCents(subscriptions),
  };
});
