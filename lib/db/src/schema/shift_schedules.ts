import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/** Employee-specific weekly shift assignment. weekday uses 0=Sunday through 6=Saturday. */
export const shiftSchedulesTable = pgTable("shift_schedules", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  weekday: integer("weekday").notNull(),
  shiftId: integer("shift_id"),
  isOff: boolean("is_off").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertShiftScheduleSchema = createInsertSchema(shiftSchedulesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShiftSchedule = z.infer<typeof insertShiftScheduleSchema>;
export type ShiftSchedule = typeof shiftSchedulesTable.$inferSelect;
