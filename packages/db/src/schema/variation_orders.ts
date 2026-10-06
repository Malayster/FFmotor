import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { workOrders } from "./work_orders";

export const variationOrders = sqliteTable("variation_orders", {
  id: text("id").primaryKey(),
  workOrderId: text("work_order_id")
    .notNull()
    .references(() => workOrders.id),
  voNumber: text("vo_number").notNull().unique(),
  title: text("title").notNull(),
  reason: text("reason").notNull(),
  partCode: text("part_code").notNull(),
  partName: text("part_name").notNull(),
  partCost: real("part_cost").notNull().default(0),
  laborCost: real("labor_cost").notNull().default(0),
  totalAmount: real("total_amount").notNull().default(0),
  photoUrl: text("photo_url"),
  token: text("token").notNull().unique(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  requestedBy: text("requested_by").notNull(),
  customerPhone: text("customer_phone").notNull(),
  approvedAt: text("approved_at"),
  customerNotes: text("customer_notes"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
});

