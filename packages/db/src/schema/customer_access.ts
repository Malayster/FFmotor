import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const customerAccess = sqliteTable("customer_access", {
  id: text("id").primaryKey(),
  phone: text("phone").notNull(),
  pinCode: text("pin_code").notNull(),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});
