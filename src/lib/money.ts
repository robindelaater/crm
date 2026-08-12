import * as v from "valibot";
import type { BillingPeriod } from "$lib/server/db/schema";

const monthsPerPeriod: Record<BillingPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export const monthlyEquivalentCents = (amountCents: number, billingPeriod: BillingPeriod) =>
  Math.round(amountCents / monthsPerPeriod[billingPeriod]);

type Recurring = { amountCents: number; billingPeriod: BillingPeriod };

export const totalMonthlyEquivalentCents = (recurring: Recurring[]) =>
  recurring.reduce(
    (total, { amountCents, billingPeriod }) =>
      total + monthlyEquivalentCents(amountCents, billingPeriod),
    0,
  );

const euros = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export const formatAmount = (cents: number) => euros.format(cents / 100);

export const formatAmountInput = (cents: number) =>
  `${Math.trunc(cents / 100)},${String(cents % 100).padStart(2, "0")}`;

export const billingPeriodLabels: Record<BillingPeriod, string> = {
  monthly: "per month",
  quarterly: "per quarter",
  yearly: "per year",
};

export const billingPeriodOptions = Object.keys(billingPeriodLabels) as BillingPeriod[];

const stripped = (input: string) => input.replace(/[\s €]/g, "");

const groupingSeparator = /^\d{1,3}(?:([.,])\d{3})+$/;

const withoutGrouping = (input: string) => {
  if (groupingSeparator.test(input)) return input.replace(/[.,]/g, "");
  if (!/[.,].*[.,]/.test(input)) return input;

  const lastSeparator = Math.max(input.lastIndexOf("."), input.lastIndexOf(","));
  const head = input.slice(0, lastSeparator);

  return groupingSeparator.test(head)
    ? head.replace(/[.,]/g, "") + input.slice(lastSeparator)
    : null;
};

const decimalAmount = /^(\d+)(?:[.,](\d{1,2}))?$/;

export const parseAmountToCents = (input: string) => {
  const digits = withoutGrouping(stripped(input));
  const match = digits && decimalAmount.exec(digits);

  if (!match) return null;

  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
};

export const amountCentsField = v.pipe(
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
