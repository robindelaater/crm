import { form, getRequestEvent, query } from "$app/server";
import { redirect } from "@sveltejs/kit";
import { asc } from "drizzle-orm";
import * as v from "valibot";
import { getDb } from "$lib/server/db";
import { billingPeriods, contract } from "$lib/server/db/schema";
import { today, withContractLifecycle } from "$lib/lifecycle";
import { parseAmountToCents } from "$lib/money";
import { getClient } from "../clients/clients.remote";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const listContracts = query(async () => {
  const contracts = await db().query.contract.findMany({
    orderBy: asc(contract.expiresOn),
    with: { client: true, project: true },
  });

  const on = today();

  return contracts.map((contract) => withContractLifecycle(contract, on));
});

const amountCents = v.pipe(
  v.string(),
  v.rawTransform<string, number>(({ dataset, addIssue, NEVER }) => {
    const cents = parseAmountToCents(dataset.value);

    if (cents === null) {
      addIssue({ message: "Amount must be an amount in euros, like 1250,00" });
      return NEVER;
    }

    return cents;
  }),
);

const optionalId = v.pipe(
  v.string(),
  v.transform((value) => value || null),
);

export const createContractForm = form(
  v.object({
    clientId: v.pipe(v.string(), v.minLength(1, "Client is required")),
    projectId: optionalId,
    name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
    startsOn: v.pipe(v.string(), v.isoDate("Start date is required")),
    expiresOn: v.pipe(v.string(), v.isoDate("Expiry date is required")),
    amountCents,
    billingPeriod: v.picklist(billingPeriods),
    notes: v.pipe(
      v.string(),
      v.trim(),
      v.transform((value) => value || null),
    ),
  }),
  async (values) => {
    await db().insert(contract).values(values);

    await listContracts().refresh();
    await getClient(values.clientId).refresh();

    redirect(303, "/contracts");
  },
);
