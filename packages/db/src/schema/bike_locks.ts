import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { motorcycles } from "./sales";
import { users } from "./users";

export const bikeLocks = sqliteTable("bike_locks", {
  id: text("id").primaryKey(),
  bookingNo: text("booking_no").notNull().unique(),
  motorcycleId: text("motorcycle_id").notNull().references(() => motorcycles.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerIc: text("customer_ic"),
  depositAmount: real("deposit_amount").notNull().default(0),
  loanProvider: text("loan_provider").notNull().default("Tunai / Tiada"),
  loanStatus: text("loan_status", { enum: ["pending", "approved", "rejected", "na"] }).notNull().default("pending"),
  isContractSigned: integer("is_contract_signed", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["locked", "completed", "cancelled"] }).notNull().default("locked"),
  salespersonId: text("salesperson_id").references(() => users.id),
  lockedAt: text("locked_at").notNull(),
  notes: text("notes"),
});

