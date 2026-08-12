import type { ContractStatus, ProjectStatus } from "$lib/server/db/schema";

export type ProjectLifecycle = "unscheduled" | "scheduled" | "running" | "completed" | "cancelled";
export type ContractLifecycle = "active" | "non_renewing" | "expired" | "cancelled";

type ProjectDates = { status: ProjectStatus; startedOn: string | null; completedOn: string | null };
type ContractDates = { status: ContractStatus; expiresOn: string };

export const today = () => new Date().toISOString().slice(0, 10);

const millisecondsPerDay = 24 * 60 * 60 * 1000;

export const daysUntil = (date: string, on = today()) =>
  Math.round((Date.parse(date) - Date.parse(on)) / millisecondsPerDay);

const addDays = (date: string, days: number) =>
  new Date(Date.parse(date) + days * millisecondsPerDay).toISOString().slice(0, 10);

export const projectLifecycle = (project: ProjectDates, on = today()): ProjectLifecycle => {
  if (project.status === "cancelled") return "cancelled";
  if (project.completedOn && project.completedOn <= on) return "completed";
  if (!project.startedOn) return "unscheduled";
  return project.startedOn <= on ? "running" : "scheduled";
};

export const contractLifecycle = (contract: ContractDates, on = today()): ContractLifecycle => {
  if (contract.status === "cancelled") return "cancelled";
  if (contract.expiresOn < on) return "expired";
  return contract.status;
};

export const isLive = ({ lifecycle }: { lifecycle: ContractLifecycle }) =>
  lifecycle === "active" || lifecycle === "non_renewing";

export const attentionWindowDays = 60;

export const attentionHorizon = (on = today()) => addDays(on, attentionWindowDays);

export const needsAttention = (contract: ContractDates, on = today()) =>
  contract.status !== "cancelled" && contract.expiresOn <= attentionHorizon(on);

type ContractTerm = { startsOn: string; expiresOn: string };

export const renewalTerm = (predecessor: ContractTerm): ContractTerm => {
  const startsOn = addDays(predecessor.expiresOn, 1);

  return {
    startsOn,
    expiresOn: addDays(startsOn, daysUntil(predecessor.expiresOn, predecessor.startsOn)),
  };
};

export const isRenewable = ({ lifecycle }: { lifecycle: ContractLifecycle }) =>
  lifecycle !== "cancelled";

export const withProjectLifecycle = <T extends ProjectDates>(project: T, on = today()) => ({
  ...project,
  lifecycle: projectLifecycle(project, on),
});

export const withContractLifecycle = <T extends ContractDates>(contract: T, on = today()) => ({
  ...contract,
  lifecycle: contractLifecycle(contract, on),
  daysUntilExpiry: daysUntil(contract.expiresOn, on),
});

export const projectLifecycleLabels: Record<ProjectLifecycle, string> = {
  unscheduled: "Unscheduled",
  scheduled: "Scheduled",
  running: "Running",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const contractLifecycleLabels: Record<ContractLifecycle, string> = {
  active: "Active",
  non_renewing: "Non-renewing",
  expired: "Expired",
  cancelled: "Cancelled",
};
