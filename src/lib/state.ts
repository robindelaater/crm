import type { ContractStatus, ProjectStatus } from "$lib/server/db/schema";

export type ProjectState = "unscheduled" | "running" | "completed" | "cancelled";
export type ContractState = "active" | "non_renewing" | "expired" | "cancelled";

export const today = () => new Date().toISOString().slice(0, 10);

export const projectState = (
  project: { status: ProjectStatus; startedOn: string | null; completedOn: string | null },
  on = today(),
): ProjectState => {
  if (project.status === "cancelled") return "cancelled";
  if (project.completedOn && project.completedOn <= on) return "completed";
  if (project.startedOn && project.startedOn <= on) return "running";
  return "unscheduled";
};

export const contractState = (
  contract: { status: ContractStatus; expiresOn: string },
  on = today(),
): ContractState => {
  if (contract.status === "cancelled") return "cancelled";
  if (contract.expiresOn < on) return "expired";
  return contract.status;
};

export const projectStateLabels: Record<ProjectState, string> = {
  unscheduled: "Unscheduled",
  running: "Running",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const contractStateLabels: Record<ContractState, string> = {
  active: "Active",
  non_renewing: "Non-renewing",
  expired: "Expired",
  cancelled: "Cancelled",
};
