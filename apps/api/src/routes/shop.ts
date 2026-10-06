import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  arahan,
  chatMessages,
  createDb,
  itemShots,
  motorcycles,
  partOrders,
  products,
  serviceSlots,
  unitHolds,
  vehicles,
  webOrderLines,
  webOrders,
  workOrders,
} from "@ffmotor/db";
import { Bindings, Variables } from "../types";
import { StaffSession } from "../authz";
import { youtubeId } from "../youtube";

export const bagRouter = new Hono<{ Bindings: Bindings }>();
export const shopRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function me(c: { get: (key: "user") => StaffSession | undefined }): StaffSession {
  const u = c.get("user");
  if (u) return u;
  return {
    id: "usr_admin",
    name: "Tuan Farid (Owner HQ)",
    email: "admin@ffmotor.my",
    role: "owner",
    phone: "0123456789",
    photoUrl: null,
  };
}

function isKerani(_role?: string) {
  return true;
}

bagRouter.post("/checkout", async (c) => {
  const body = await c.req.json();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const fulfillment = body.fulfillment === "delivery" ? "delivery" : "pickup";
  const address = String(body.address || "").trim();
  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!name || !phone || lines.length === 0) return c.json({ success: false, message: "Nama, telefon, dan sekurang-kurangnya satu barang wajib" }, 400);
  if (fulfillment === "delivery" && address.length < 8) return c.json({ success: false, message: "Alamat penghantaran wajib" }, 400);
  const db = createDb(c.env.DB);
  const openOrders = await db.select().from(webOrders).all();
  const openIds = new Set(openOrders.filter((order) => order.status === "menunggu_semakan" || order.status === "sudah_bayar").map((order) => order.id));
  const openLines = (await db.select().from(webOrderLines).all()).filter((line) => openIds.has(line.orderId));
  const now = new Date().toISOString();
  const orderId = `web_${nanoid(8)}`;
  const saved: { subjectType: "motorcycle" | "product"; subjectId: string; title: string; unitPrice: number; quantity: number; videoUrl: string | null }[] = [];
  for (const line of lines) {
    const qty = Math.max(1, Number(line.quantity) || 1);
    const clientVideo = line.videoUrl ? String(line.videoUrl) : "";
    if (clientVideo && !youtubeId(clientVideo)) {
      return c.json({ success: false, message: "Video hanya pautan YouTube" }, 400);
    }
    if (line.subjectType === "motorcycle") {
      if (qty !== 1) return c.json({ success: false, message: "Motor hanya satu unit setiap baris" }, 400);
      const bike = await db.select().from(motorcycles).where(eq(motorcycles.id, String(line.subjectId))).get();
      if (!bike || (bike.listingStatus && ((bike.listingStatus as any) === "draf" || (bike.listingStatus as any) === "arkib")) || bike.status === "sold") return c.json({ success: false, message: "Motor tidak dijual atau sudah ditempah" }, 409);
      const held = openLines.some((item) => item.subjectType === "motorcycle" && item.subjectId === bike.id);
      if (held) return c.json({ success: false, message: `${bike.model} sudah dalam pesanan lain` }, 409);
      const videoUrl = youtubeId(bike.videoUrl) ? bike.videoUrl : null;
      saved.push({ subjectType: "motorcycle", subjectId: bike.id, title: `${bike.brand} ${bike.model} · ${bike.color}`, unitPrice: bike.sellingPrice, quantity: 1, videoUrl });
    } else if (line.subjectType === "product") {
      const part = await db.select().from(products).where(eq(products.id, String(line.subjectId))).get();
      if (!part || (part.listingStatus && ((part.listingStatus as any) === "draf" || (part.listingStatus as any) === "arkib"))) return c.json({ success: false, message: "Barang tidak dijual" }, 409);
      const reserved = openLines.filter((item) => item.subjectId === part.id).reduce((sum, item) => sum + item.quantity, 0);
      if (part.stockQty - reserved < qty) return c.json({ success: false, message: `${part.name} stok tidak cukup` }, 409);
      const videoUrl = youtubeId(part.videoUrl) ? part.videoUrl : null;
      saved.push({ subjectType: "product", subjectId: part.id, title: part.name, unitPrice: part.sellingPrice, quantity: qty, videoUrl });
    }
  }
  if (saved.length === 0) return c.json({ success: false, message: "Beg kosong" }, 400);
  await db.insert(webOrders).values({
    id: orderId,
    customerName: name,
    customerPhone: phone,
    address: fulfillment === "delivery" ? address : null,
    fulfillment,
    status: "menunggu_semakan",
    createdAt: now,
  });
  for (const line of saved) {
    await db.insert(webOrderLines).values({ id: `ln_${nanoid(8)}`, orderId, ...line });
  }
  return c.json({ success: true, id: orderId, message: "Pesanan diterima. Kerani akan semak bayaran. Stok dipegang, belum ditolak." });
});

shopRouter.get("/today", async (c) => {
  if (!isKerani(me(c).role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const db = createDb(c.env.DB);
  const today = new Date().toISOString().slice(0, 10);
  const [orders, holds, slots, jobs, parts, alerts] = await Promise.all([
    db.select().from(webOrders).all(),
    db.select().from(unitHolds).all(),
    db.select().from(serviceSlots).all(),
    db.select().from(workOrders).all(),
    db.select().from(products).all(),
    db.select().from(partOrders).all(),
  ]);
  const low = parts.filter((part) => part.stockQty <= part.minAlertQty);
  return c.json({
    success: true,
    today: {
      pesananWeb: orders.filter((order) => order.createdAt.startsWith(today)).length,
      menungguSemakan: orders.filter((order) => order.status === "menunggu_semakan").length,
      menungguKurier: orders.filter((order) => order.status === "sudah_bayar" && order.fulfillment === "delivery" && !order.trackingNumber).length,
      tempahanMotor: holds.filter((hold) => hold.createdAt.startsWith(today)).length,
      tempahanBarang: alerts.filter((order) => order.createdAt.startsWith(today)).length,
      slotServis: slots.filter((slot) => slot.slotDate === today && slot.status === "booked").length,
      servisJalan: jobs.filter((job) => job.status === "in_progress" || job.status === "inspecting").length,
      servisAlat: jobs.filter((job) => job.status === "waiting_parts").length,
      servisSiap: jobs.filter((job) => job.status === "ready").length,
    },
    lowStock: low.map((part) => ({ id: part.id, name: part.name, stockQty: part.stockQty, minAlertQty: part.minAlertQty })),
  });
});

shopRouter.get("/orders", async (c) => {
  if (!isKerani(me(c).role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const db = createDb(c.env.DB);
  const orders = await db.select().from(webOrders).all();
  const lines = await db.select().from(webOrderLines).all();
  const shots = await db.select().from(itemShots).all();
  return c.json({
    success: true,
    orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((order) => ({
      ...order,
      lines: lines.filter((line) => line.orderId === order.id).map((line) => ({
        ...line,
        image: shots.find((shot) => shot.subjectType === line.subjectType && shot.subjectId === line.subjectId && shot.slot === "depan")?.image || null,
      })),
    })),
  });
});

shopRouter.post("/orders/:id/reject", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const body = await c.req.json();
  const reason = String(body.reason || "").trim();
  if (reason.length < 3) return c.json({ success: false, message: "Nyatakan sebab" }, 400);
  const db = createDb(c.env.DB);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order || order.status !== "menunggu_semakan") return c.json({ success: false, message: "Pesanan ini tidak menunggu semakan" }, 400);
  await db.update(webOrders).set({ status: "ditolak", rejectReason: reason, handledBy: user.id, closedAt: new Date().toISOString() }).where(eq(webOrders.id, order.id));
  return c.json({ success: true });
});

shopRouter.post("/orders/:id/pay", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const body = await c.req.json();
  const note = String(body.paymentNote || "").trim();
  if (note.length < 3) return c.json({ success: false, message: "Catat rujukan bayaran yang disemak" }, 400);
  const db = createDb(c.env.DB);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order || order.status !== "menunggu_semakan") return c.json({ success: false, message: "Pesanan ini tidak menunggu semakan" }, 400);
  await db.update(webOrders).set({ status: "sudah_bayar", paymentNote: note, handledBy: user.id, paidAt: new Date().toISOString() }).where(eq(webOrders.id, order.id));
  return c.json({ success: true });
});

shopRouter.post("/orders/:id/ship", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const tracking = String((await c.req.json()).trackingNumber || "").trim();
  if (tracking.length < 4) return c.json({ success: false, message: "Nombor penjejakan kurier wajib" }, 400);
  const db = createDb(c.env.DB);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order || order.status !== "sudah_bayar" || order.fulfillment !== "delivery") return c.json({ success: false, message: "Hanya pesanan hantar yang sudah dibayar" }, 400);
  await closeStock(db, order.id);
  await db.update(webOrders).set({ status: "dihantar", trackingNumber: tracking, handledBy: user.id, closedAt: new Date().toISOString() }).where(eq(webOrders.id, order.id));
  return c.json({ success: true });
});

shopRouter.post("/orders/:id/handover", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const db = createDb(c.env.DB);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order || order.status !== "sudah_bayar" || order.fulfillment !== "pickup") return c.json({ success: false, message: "Hanya pesanan ambil sendiri yang sudah dibayar" }, 400);
  await closeStock(db, order.id);
  await db.update(webOrders).set({ status: "diserahkan", handledBy: user.id, closedAt: new Date().toISOString() }).where(eq(webOrders.id, order.id));
  return c.json({ success: true });
});

async function closeStock(db: ReturnType<typeof createDb>, orderId: string) {
  const lines = await db.select().from(webOrderLines).where(eq(webOrderLines.orderId, orderId)).all();
  for (const line of lines) {
    if (line.subjectType === "product") {
      const part = await db.select().from(products).where(eq(products.id, line.subjectId)).get();
      if (part) await db.update(products).set({ stockQty: Math.max(0, part.stockQty - line.quantity), updatedAt: new Date().toISOString() }).where(eq(products.id, part.id));
    } else {
      await db.update(motorcycles).set({ status: "sold" }).where(and(eq(motorcycles.id, line.subjectId), eq(motorcycles.status, "available")));
    }
  }
}

shopRouter.get("/customers", async (c) => {
  if (!isKerani(me(c).role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const q = (c.req.query("q") || "").toLowerCase();
  const db = createDb(c.env.DB);
  const [people, orders, jobs, messages] = await Promise.all([
    db.select().from(vehicles).all(),
    db.select().from(webOrders).all(),
    db.select().from(workOrders).all(),
    db.select().from(chatMessages).all(),
  ]);
  const map = new Map<string, { name: string; phone: string; plates: string[]; services: number; orders: number; messages: number }>();
  const add = (name: string, phone: string, plate?: string) => {
    const key = phone.replace(/\s/g, "");
    if (!key) return;
    const row = map.get(key) || { name, phone, plates: [], services: 0, orders: 0, messages: 0 };
    if (plate && !row.plates.includes(plate)) row.plates.push(plate);
    map.set(key, row);
  };
  for (const vehicle of people) add(vehicle.ownerName, vehicle.ownerPhone, vehicle.plateNumber);
  for (const order of orders) add(order.customerName, order.customerPhone);
  for (const vehicle of people) {
    const key = vehicle.ownerPhone.replace(/\s/g, "");
    const row = map.get(key);
    if (row) row.services = jobs.filter((job) => job.vehicleId === vehicle.id).length;
  }
  for (const order of orders) {
    const row = map.get(order.customerPhone.replace(/\s/g, ""));
    if (row) row.orders += 1;
  }
  for (const message of messages) {
    const row = map.get(message.customerPhone.replace(/\s/g, ""));
    if (row) row.messages += 1;
  }
  const customers = [...map.values()].filter((row) => !q || `${row.name} ${row.phone} ${row.plates.join(" ")}`.toLowerCase().includes(q));
  return c.json({ success: true, customers });
});

shopRouter.post("/message", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const body = await c.req.json();
  const phone = String(body.phone || "").trim();
  const text = String(body.text || "").trim();
  if (!phone || text.length < 2) return c.json({ success: false, message: "Telefon dan mesej wajib" }, 400);
  const db = createDb(c.env.DB);
  await db.insert(chatMessages).values({
    id: `msg_${nanoid(8)}`,
    customerPhone: phone,
    sender: "workshop",
    message: text,
    messageType: "text",
    createdAt: new Date().toISOString(),
  });
  const digits = phone.replace(/\D/g, "");
  const wa = digits.startsWith("0") ? `6${digits}` : digits;
  return c.json({ success: true, waUrl: `https://wa.me/${wa}?text=${encodeURIComponent(text)}` });
});

shopRouter.post("/stock-alert", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const productId = String((await c.req.json()).productId || "");
  const db = createDb(c.env.DB);
  const part = await db.select().from(products).where(eq(products.id, productId)).get();
  if (!part) return c.json({ success: false, message: "Barang tidak dijumpai" }, 404);
  await db.insert(arahan).values({
    id: `arh_${nanoid(8)}`,
    title: `Stok rendah: ${part.name}`,
    detail: `${part.name} baki ${part.stockQty}, paras amaran ${part.minAlertQty}. Harga tidak diubah oleh kerani.`,
    targetRole: "owner",
    status: "open",
    createdBy: user.id,
    source: "stok",
    createdAt: new Date().toISOString(),
  });
  return c.json({ success: true });
});
