import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const staffSessions = sqliteTable("staff_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});
