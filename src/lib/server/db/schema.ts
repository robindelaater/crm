import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";

export const projectStatuses = ["active", "cancelled"] as const;
export const contractStatuses = ["active", "non_renewing", "cancelled"] as const;
export const subscriptionStatuses = ["active", "cancelled"] as const;
export const billingPeriods = ["monthly", "quarterly", "yearly"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];
export type ContractStatus = (typeof contractStatuses)[number];
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];
export type BillingPeriod = (typeof billingPeriods)[number];

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

export const client = sqliteTable("client", {
  id: id(),
  name: text("name").notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const contact = sqliteTable("contact", {
  id: id(),
  clientId: text("client_id")
    .notNull()
    .references(() => client.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role"),
  createdAt: createdAt(),
});

export const project = sqliteTable("project", {
  id: id(),
  clientId: text("client_id")
    .notNull()
    .references(() => client.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status", { enum: projectStatuses }).notNull().default("active"),
  startedOn: text("started_on"),
  completedOn: text("completed_on"),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const contract = sqliteTable("contract", {
  id: id(),
  clientId: text("client_id")
    .notNull()
    .references(() => client.id, { onDelete: "cascade" }),
  contactId: text("contact_id").references(() => contact.id, { onDelete: "set null" }),
  projectId: text("project_id").references(() => project.id, { onDelete: "set null" }),
  renewalOfId: text("renewal_of_id").references((): AnySQLiteColumn => contract.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  status: text("status", { enum: contractStatuses }).notNull().default("active"),
  startsOn: text("starts_on").notNull(),
  expiresOn: text("expires_on").notNull(),
  amountCents: integer("amount_cents").notNull(),
  billingPeriod: text("billing_period", { enum: billingPeriods }).notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const subscription = sqliteTable("subscription", {
  id: id(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull(),
  status: text("status", { enum: subscriptionStatuses }).notNull().default("active"),
  startedOn: text("started_on").notNull(),
  amountCents: integer("amount_cents").notNull(),
  billingPeriod: text("billing_period", { enum: billingPeriods }).notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const clientRelations = relations(client, ({ many }) => ({
  contacts: many(contact),
  projects: many(project),
  contracts: many(contract),
}));

export const contactRelations = relations(contact, ({ one, many }) => ({
  client: one(client, { fields: [contact.clientId], references: [client.id] }),
  contracts: many(contract),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  client: one(client, { fields: [project.clientId], references: [client.id] }),
  contracts: many(contract),
}));

export const contractRelations = relations(contract, ({ one }) => ({
  client: one(client, { fields: [contract.clientId], references: [client.id] }),
  contact: one(contact, { fields: [contract.contactId], references: [contact.id] }),
  project: one(project, { fields: [contract.projectId], references: [project.id] }),
  renewalOf: one(contract, {
    relationName: "renewal",
    fields: [contract.renewalOfId],
    references: [contract.id],
  }),
}));
