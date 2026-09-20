import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const motorcycles = sqliteTable("motorcycles", {
  id: text("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  engineNo: text("engine_no").notNull().unique(),
  chassisNo: text("chassis_no").notNull().unique(),
  condition: text("condition", { enum: ["new", "used"] }).notNull().default("new"),
  currentMileage: integer("current_mileage").default(0), // Untuk used motor
  costPrice: real("cost_price").notNull().default(0),
  sellingPrice: real("selling_price").notNull().default(0),
  status: text("status", { enum: ["available", "booked", "loan_pending", "sold"] }).notNull().default("available"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const motorSales = sqliteTable("motor_sales", {
  id: text("id").primaryKey(),
  motorcycleId: text("motorcycle_id").notNull().references(() => motorcycles.id),
  salespersonId: text("salesperson_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerIc: text("customer_ic").notNull(),
  paymentType: text("payment_type", { enum: ["cash", "loan_bank", "credit_kedai"] }).notNull(),
  salePrice: real("sale_price").notNull(),
  depositPaid: real("deposit_paid").default(0),
  assignedPlateNumber: text("assigned_plate_number"), // No plat baru / sedia ada
  status: text("status", { enum: ["pending_jpj", "ready_delivery", "delivered"] }).notNull().default("pending_jpj"),
  soldAt: text("sold_at").notNull(),
});

