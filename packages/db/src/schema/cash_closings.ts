import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const cashClosings = sqliteTable("cash_closings", {
  id: text("id").primaryKey(),
  zReportNumber: text("z_report_number").notNull().unique(),
  closingDate: text("closing_date").notNull(),
  cashierId: text("cashier_id").references(() => users.id),
  openingFloat: real("opening_float").notNull().default(200),
  systemExpectedCash: real("system_expected_cash").notNull().default(0),
  physicalCashCounted: real("physical_cash_counted").notNull().default(0),
  variance: real("variance").notNull().default(0),
  pettyCashTotal: real("petty_cash_total").notNull().default(0),
  isBalanced: integer("is_balanced", { mode: "boolean" }).notNull().default(true),
  notes: text("notes"),
  closedAt: text("closed_at").notNull(),
});

