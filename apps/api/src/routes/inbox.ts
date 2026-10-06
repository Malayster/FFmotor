import { Hono } from "hono";
import { eq, desc, asc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { chatMessages, workOrders } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const inboxRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai semua mesej terkini yang dihantar oleh bengkel
inboxRouter.get("/recent", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db
    .select()
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(50)
    .all();
  return c.json({ success: true, messages: list });
});

// Dapatkan sejarah mesej untuk satu nombor telefon
inboxRouter.get("/messages/:phone", async (c) => {
  const db = createDb(c.env.DB);
  const phone = c.req.param("phone");

  const list = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.customerPhone, phone))
    .orderBy(asc(chatMessages.createdAt))
    .all();

  return c.json({ success: true, messages: list });
});

// Simpan mesej baharu (WhatsApp / Sistem)
inboxRouter.post("/messages", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();

  const id = nanoid();
  const record = {
    id,
    customerPhone: body.customerPhone,
    workOrderId: body.workOrderId || null,
    sender: body.sender || "workshop",
    message: body.message,
    messageType: body.messageType || "text",
    createdAt: new Date().toISOString(),
  };

  await db.insert(chatMessages).values(record).run();

  return c.json({ success: true, message: record });
});

