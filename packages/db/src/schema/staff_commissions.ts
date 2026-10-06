import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { workOrders } from "./work_orders";

export const staffProfiles = sqliteTable("staff_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  specialty: text("specialty").default("Servis Umum & CVT"),
  basicSalary: real("basic_salary").default(1800),
  commissionRate: real("commission_rate").default(15), // 15% dari labor
  activeBay: integer("active_bay"), // Bay 1 - 4
  rating: real("rating").default(5.0),
  totalJobsDone: integer("total_jobs_done").default(0),
});

export const mechanicCommissions = sqliteTable("mechanic_commissions", {
  id: text("id").primaryKey(),
  mechanicId: text("mechanic_id").notNull().references(() => users.id),
  workOrderId: text("work_order_id").notNull().references(() => workOrders.id),
  workOrderNumber: text("work_order_number").notNull(),
  plateNumber: text("plate_number").notNull(),
  laborTotal: real("labor_total").notNull().default(0),
  commissionPercent: real("commission_percent").notNull().default(15),
  commissionAmount: real("commission_amount").notNull().default(0),
  status: text("status", { enum: ["accrued", "paid"] }).notNull().default("accrued"),
  createdAt: text("created_at").notNull(),
  paidAt: text("paid_at"),
});

