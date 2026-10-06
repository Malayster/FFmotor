import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { motorcycles } from "./sales";
import { users } from "./users";

export const loanApplications = sqliteTable("loan_applications", {
  id: text("id").primaryKey(),
  appNumber: text("app_number").notNull().unique(),
  motorcycleId: text("motorcycle_id").notNull().references(() => motorcycles.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerIc: text("customer_ic").notNull(),
  salaryMonthly: real("salary_monthly").notNull().default(0),
  depositAmount: real("deposit_amount").notNull().default(0),
  loanAmount: real("loan_amount").notNull().default(0),
  loanTermMonths: integer("loan_term_months").notNull().default(36), // 36 bulan (3 tahun)
  monthlyInstallment: real("monthly_installment").notNull().default(0),
  loanProvider: text("loan_provider").notNull().default("AEON Credit Service"),
  stage: text("stage", {
    enum: [
      "prospect",
      "docs_collected",
      "submitted",
      "approved",
      "jpj_registered",
      "delivered",
      "rejected",
    ],
  }).notNull().default("prospect"),
  salespersonId: text("salesperson_id").references(() => users.id),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

