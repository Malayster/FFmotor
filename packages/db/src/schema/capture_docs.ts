import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const captureDocs = sqliteTable("capture_docs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind", { enum: ["resit", "lain"] }).notNull().default("resit"),
  note: text("note"),
  status: text("status", { enum: ["draf", "disimpan"] }).notNull().default("draf"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});
