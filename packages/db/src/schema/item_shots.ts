import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const itemShots = sqliteTable("item_shots", {
  id: text("id").primaryKey(),
  subjectType: text("subject_type", { enum: ["motorcycle", "product", "document", "service"] }).notNull(),
  subjectId: text("subject_id").notNull(),
  slot: text("slot").notNull(),
  label: text("label"),
  image: text("image").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: text("created_at").notNull(),
});
