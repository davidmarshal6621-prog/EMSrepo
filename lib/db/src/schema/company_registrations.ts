import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const companyRegistrationsTable = pgTable("company_registrations", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email").notNull().unique(),
  plan: text("plan").notNull().default("trial"),
  status: text("status").notNull().default("trialing"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }).notNull(),
  maxEmployees: integer("max_employees").notNull().default(10),
  features: text("features").notNull().default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});