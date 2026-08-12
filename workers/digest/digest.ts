import { contractLifecycleLabels } from "$lib/lifecycle";
import type { ContractNeedingAttention } from "$lib/server/attention";

const sendingHourInAmsterdam = 8;

const amsterdamHour = (at: Date) =>
  Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Amsterdam",
      hour: "numeric",
      hour12: false,
    }).format(at),
  );

export const isSendingHour = (at: Date) => amsterdamHour(at) === sendingHourInAmsterdam;

const euros = (cents: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);

const timing = ({ daysUntilExpiry }: ContractNeedingAttention) => {
  if (daysUntilExpiry < 0) return `expired ${Math.abs(daysUntilExpiry)} days ago`;
  if (daysUntilExpiry === 0) return "expires today";
  if (daysUntilExpiry === 1) return "expires tomorrow";
  return `expires in ${daysUntilExpiry} days`;
};

const line = (contract: ContractNeedingAttention) =>
  `${contract.client.name} — ${contract.name} (${euros(contract.amountCents)} / ${contract.billingPeriod}, ${contractLifecycleLabels[contract.lifecycle]}) — ${timing(contract)}, ${contract.expiresOn}`;

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const digestSubject = (contracts: ContractNeedingAttention[]) =>
  contracts.length === 1
    ? `1 contract needs attention`
    : `${contracts.length} contracts need attention`;

export const digestText = (contracts: ContractNeedingAttention[], appUrl: string) =>
  [...contracts.map((contract) => `• ${line(contract)}`), "", appUrl].join("\n");

export const digestHtml = (contracts: ContractNeedingAttention[], appUrl: string) =>
  [
    "<ul>",
    ...contracts.map((contract) => `<li>${escape(line(contract))}</li>`),
    "</ul>",
    `<p><a href="${escape(appUrl)}">Open the CRM</a></p>`,
  ].join("");
