import { form, getRequestEvent, query } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import { asc, eq } from "drizzle-orm";
import * as v from "valibot";
import { getDb } from "$lib/server/db";
import { billingPeriods, subscription } from "$lib/server/db/schema";
import { amountCentsField } from "$lib/money";

const db = () => getDb(getRequestEvent().platform!.env.DB);

export const listSubscriptions = query(async () =>
  db().select().from(subscription).orderBy(asc(subscription.name)),
);

export const getSubscription = query(v.string(), async (id) => {
  const found = await db().query.subscription.findFirst({
    where: (row, { eq }) => eq(row.id, id),
  });

  if (!found) error(404, "Subscription not found");

  return found;
});

const subscriptionDetails = {
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "Name is required")),
  vendor: v.pipe(v.string(), v.trim(), v.minLength(1, "Vendor is required")),
  startedOn: v.pipe(v.string(), v.isoDate("Start date is required")),
  amountCents: amountCentsField,
  billingPeriod: v.picklist(billingPeriods),
  notes: v.pipe(
    v.string(),
    v.trim(),
    v.transform((value) => value || null),
  ),
};

export const createSubscriptionForm = form(v.object(subscriptionDetails), async (values) => {
  await db().insert(subscription).values(values);

  await listSubscriptions().refresh();

  redirect(303, "/subscriptions");
});

export const updateSubscriptionForm = form(
  v.object({ id: v.string(), ...subscriptionDetails }),
  async ({ id, ...values }) => {
    const updated = await db()
      .update(subscription)
      .set(values)
      .where(eq(subscription.id, id))
      .returning({ id: subscription.id });

    if (!updated.length) error(404, "Subscription not found");

    await getSubscription(id).refresh();
    await listSubscriptions().refresh();

    redirect(303, `/subscriptions/${id}`);
  },
);

export const deleteSubscriptionForm = form(v.object({ id: v.string() }), async ({ id }) => {
  await db().delete(subscription).where(eq(subscription.id, id));

  await listSubscriptions().refresh();

  redirect(303, "/subscriptions");
});
