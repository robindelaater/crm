import type { BillingPeriod } from "$lib/server/db/schema";

const monthsPerPeriod: Record<BillingPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export const monthlyEquivalentCents = (amountCents: number, billingPeriod: BillingPeriod) =>
  Math.round(amountCents / monthsPerPeriod[billingPeriod]);

const euros = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export const formatAmount = (cents: number) => euros.format(cents / 100);

export const billingPeriodLabels: Record<BillingPeriod, string> = {
  monthly: "per month",
  quarterly: "per quarter",
  yearly: "per year",
};
