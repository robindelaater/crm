import { and, asc, lte, ne } from "drizzle-orm";
import type { getDb } from "$lib/server/db";
import { contract } from "$lib/server/db/schema";
import { attentionHorizon, today, withContractLifecycle } from "$lib/lifecycle";

export const listContractsNeedingAttention = async (db: ReturnType<typeof getDb>, on = today()) => {
  const contracts = await db.query.contract.findMany({
    where: and(ne(contract.status, "cancelled"), lte(contract.expiresOn, attentionHorizon(on))),
    orderBy: asc(contract.expiresOn),
    with: { client: true },
  });

  return contracts.map((found) => withContractLifecycle(found, on));
};

export type ContractNeedingAttention = Awaited<
  ReturnType<typeof listContractsNeedingAttention>
>[number];
