import { form, getRequestEvent, query } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import { asc, eq } from "drizzle-orm";
import * as v from "valibot";
import { getDb } from "$lib/server/db";
import { billingPeriods, contract } from "$lib/server/db/schema";
import { today, withContractLifecycle } from "$lib/lifecycle";
import { amountCentsField } from "$lib/money";
import { getClient } from "../clients/clients.remote";
import { listContractsNeedingAttention } from "../attention.remote";
import { getStats } from "../stats.remote";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const listContracts = query(async () => {
  const contracts = await db().query.contract.findMany({
    orderBy: asc(contract.expiresOn),
    with: { client: true, project: true },
  });

  const on = today();

  return contracts.map((contract) => withContractLifecycle(contract, on));
});

export const getContract = query(v.string(), async (id) => {
  const found = await db().query.contract.findFirst({
    where: (row, { eq }) => eq(row.id, id),
    with: { client: true, project: true, contact: true, renewalOf: true, renewals: true },
  });

  if (!found) error(404, "Contract not found");

  return withContractLifecycle(found);
});

const optionalId = v.pipe(
  v.string(),
  v.transform((value) => value || null),
);

const contractDetails = {
  clientId: v.pipe(v.string(), v.minLength(1, "Client is required")),
  projectId: optionalId,
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
  startsOn: v.pipe(v.string(), v.isoDate("Start date is required")),
  expiresOn: v.pipe(v.string(), v.isoDate("Expiry date is required")),
  amountCents: amountCentsField,
  billingPeriod: v.picklist(billingPeriods),
  notes: v.pipe(
    v.string(),
    v.trim(),
    v.transform((value) => value || null),
  ),
};

export const createContractForm = form(v.object(contractDetails), async (values) => {
  await db().insert(contract).values(values);

  await listContracts().refresh();
  await listContractsNeedingAttention().refresh();
  await getStats().refresh();
  await getClient(values.clientId).refresh();

  redirect(303, "/contracts");
});

export const renewContractForm = form(
  v.object({ renewalOfId: v.string(), ...contractDetails }),
  async (values) => {
    const predecessor = await db().query.contract.findFirst({
      where: eq(contract.id, values.renewalOfId),
      columns: { id: true },
    });

    if (!predecessor) error(404, "Contract not found");

    const [renewal] = await db().insert(contract).values(values).returning({ id: contract.id });

    await getContract(values.renewalOfId).refresh();
    await listContracts().refresh();
    await listContractsNeedingAttention().refresh();
    await getStats().refresh();
    await getClient(values.clientId).refresh();

    redirect(303, `/contracts/${renewal.id}`);
  },
);

export const updateContractForm = form(
  v.object({ id: v.string(), ...contractDetails }),
  async ({ id, ...values }) => {
    const previous = await db().query.contract.findFirst({
      where: eq(contract.id, id),
      columns: { clientId: true },
    });

    if (!previous) error(404, "Contract not found");

    await db().update(contract).set(values).where(eq(contract.id, id));

    await getContract(id).refresh();
    await listContracts().refresh();
    await listContractsNeedingAttention().refresh();
    await getStats().refresh();
    await getClient(values.clientId).refresh();

    if (previous.clientId !== values.clientId) await getClient(previous.clientId).refresh();

    redirect(303, `/contracts/${id}`);
  },
);
