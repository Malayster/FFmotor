import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { workOrders } from "./work_orders";
import { users } from "./users";

export const warrantyIssues = sqliteTable("warranty_issues", {
  id: text("id").primaryKey(),
  issueCode: text("issue_code").notNull().unique(),
  workOrderId: text("work_order_id").references(() => workOrders.id),
  plateNumber: text("plate_number").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  complaint: text("complaint").notNull(),
  mechanicInCharge: text("mechanic_in_charge").notNull(),
  severity: text("severity", { enum: ["low", "medium", "high", "critical"] }).notNull().default("medium"),
  status: text("status", { enum: ["open", "investigating", "resolved", "rejected"] }).notNull().default("open"),
  partReplaced: text("part_replaced"),
  resolutionNotes: text("resolution_notes"),
  createdAt: text("created_at").notNull(),
  resolvedAt: text("resolved_at"),
});

