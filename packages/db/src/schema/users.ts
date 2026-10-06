import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "cashier", "mechanic", "sales", "owner", "kerani_1", "kerani_2", "foreman", "affiliate"] }).notNull().default("mechanic"),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  pinCode: text("pin_code"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

