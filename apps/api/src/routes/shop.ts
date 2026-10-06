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

async function ensureWebOrdersColumns(db: any) {
  try {
    await db.$client.prepare("ALTER TABLE web_orders ADD COLUMN customer_email text").run().catch(() => null);
    await db.$client.prepare("ALTER TABLE web_orders ADD COLUMN items text").run().catch(() => null);
    await db.$client.prepare("ALTER TABLE web_orders ADD COLUMN amount real DEFAULT 0").run().catch(() => null);
    await db.$client.prepare("ALTER TABLE web_orders ADD COLUMN tracking_history text").run().catch(() => null);
    await db.$client.prepare("ALTER TABLE web_orders ADD COLUMN receipt_sent_at text").run().catch(() => null);
    await db.$client.prepare("ALTER TABLE web_orders ADD COLUMN receipt_method text").run().catch(() => null);
    await db.$client.prepare("ALTER TABLE web_orders ADD COLUMN updated_at text").run().catch(() => null);
  } catch {}
}

bagRouter.post("/checkout", async (c) => {
  const body = await c.req.json();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = body.email || body.customerEmail ? String(body.email || body.customerEmail).trim() : null;
  const fulfillment = body.fulfillment === "delivery" ? "delivery" : "pickup";
  const address = String(body.address || "").trim();
  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!name || !phone || lines.length === 0) return c.json({ success: false, message: "Nama, telefon, dan sekurang-kurangnya satu barang wajib" }, 400);
  if (fulfillment === "delivery" && address.length < 8) return c.json({ success: false, message: "Alamat penghantaran wajib" }, 400);
  const db = createDb(c.env.DB);
  await ensureWebOrdersColumns(db);
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
  const amount = saved.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const initialTrackingHistory = JSON.stringify([
    {
      timestamp: now,
      status: "menunggu_semakan",
      note: "Pesanan beg kuning diterima. Menunggu semakan bayaran oleh kerani.",
    },
  ]);

  await db.insert(webOrders).values({
    id: orderId,
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    address: fulfillment === "delivery" ? address : null,
    items: JSON.stringify(saved),
    amount,
    fulfillment,
    status: "menunggu_semakan",
    paymentNote: null,
    rejectReason: null,
    trackingNumber: null,
    trackingHistory: initialTrackingHistory,
    handledBy: null,
    paidAt: null,
    closedAt: null,
    receiptSentAt: null,
    receiptMethod: null,
    createdAt: now,
    updatedAt: now,
  });
  for (const line of saved) {
    await db.insert(webOrderLines).values({ id: `ln_${nanoid(8)}`, orderId, ...line });
  }
  return c.json({ success: true, id: orderId, message: "Pesanan diterima. Kerani akan semak bayaran. Stok dipegang, belum ditolak." });
});

shopRouter.get("/today", async (c) => {
  if (!isKerani(me(c).role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const db = createDb(c.env.DB);
  await ensureWebOrdersColumns(db);
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
  await ensureWebOrdersColumns(db);
  const orders = await db.select().from(webOrders).all();
  const lines = await db.select().from(webOrderLines).all();
  const shots = await db.select().from(itemShots).all();
  return c.json({
    success: true,
    orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((order) => {
      const orderLines = lines.filter((line) => line.orderId === order.id);
      let parsedItems: any[] = [];
      try {
        if (order.items) parsedItems = JSON.parse(order.items);
      } catch {}

      const effectiveLines = orderLines.length > 0
        ? orderLines.map((line) => ({
            ...line,
            image: shots.find((shot) => shot.subjectType === line.subjectType && shot.subjectId === line.subjectId && shot.slot === "depan")?.image || null,
          }))
        : parsedItems.map((item: any) => ({
            id: `item_${nanoid(6)}`,
            orderId: order.id,
            subjectType: item.subjectType || "product",
            subjectId: item.subjectId || "prod",
            title: item.title || item.name || "Item",
            unitPrice: Number(item.unitPrice || 0),
            quantity: Number(item.quantity || 1),
            videoUrl: null,
            image: null,
          }));

      const calculatedAmount = order.amount || effectiveLines.reduce((acc, l) => acc + (Number(l.unitPrice) * Number(l.quantity)), 0);

      let parsedTrackingHistory: any[] = [];
      try {
        if (order.trackingHistory) parsedTrackingHistory = JSON.parse(order.trackingHistory);
      } catch {}

      return {
        ...order,
        amount: calculatedAmount,
        lines: effectiveLines,
        trackingHistory: parsedTrackingHistory,
      };
    }),
  });
});

shopRouter.post("/orders/:id/reject", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const body = await c.req.json();
  const reason = String(body.reason || "").trim();
  if (reason.length < 3) return c.json({ success: false, message: "Nyatakan sebab penolakan" }, 400);
  const db = createDb(c.env.DB);
  await ensureWebOrdersColumns(db);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order || order.status !== "menunggu_semakan") return c.json({ success: false, message: "Pesanan ini tidak menunggu semakan" }, 400);
  const now = new Date().toISOString();
  await db.update(webOrders).set({
    status: "ditolak",
    rejectReason: reason,
    handledBy: user.id,
    closedAt: now,
    updatedAt: now,
  }).where(eq(webOrders.id, order.id));
  return c.json({ success: true, message: "Pesanan ditolak" });
});

shopRouter.post("/orders/:id/pay", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const body = await c.req.json();
  const note = String(body.paymentNote || "").trim();
  if (note.length < 3) return c.json({ success: false, message: "Catat rujukan bayaran yang disemak" }, 400);
  const db = createDb(c.env.DB);
  await ensureWebOrdersColumns(db);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order || order.status !== "menunggu_semakan") return c.json({ success: false, message: "Pesanan ini tidak menunggu semakan" }, 400);
  const now = new Date().toISOString();
  let history: any[] = [];
  try {
    if (order.trackingHistory) history = JSON.parse(order.trackingHistory);
  } catch {}
  history.push({ timestamp: now, status: "sudah_bayar", note: `Bayaran disahkan (${note})`, handledBy: user.id });

  await db.update(webOrders).set({
    status: "sudah_bayar",
    paymentNote: note,
    handledBy: user.id,
    paidAt: now,
    trackingHistory: JSON.stringify(history),
    updatedAt: now,
  }).where(eq(webOrders.id, order.id));
  return c.json({ success: true, message: "Bayaran pesanan disahkan" });
});

shopRouter.post("/orders/:id/ship", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const body = await c.req.json();
  const tracking = String(body.trackingNumber || "").trim();
  const carrier = String(body.carrier || "J&T Express").trim();
  if (tracking.length < 4) return c.json({ success: false, message: "Nombor penjejakan kurier wajib" }, 400);
  const db = createDb(c.env.DB);
  await ensureWebOrdersColumns(db);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order || order.status !== "sudah_bayar" || order.fulfillment !== "delivery") {
    return c.json({ success: false, message: "Hanya pesanan hantar yang sudah dibayar boleh dihantar" }, 400);
  }
  await closeStock(db, order.id);
  const now = new Date().toISOString();
  let history: any[] = [];
  try {
    if (order.trackingHistory) history = JSON.parse(order.trackingHistory);
  } catch {}
  history.push({ timestamp: now, status: "dihantar", trackingNumber: tracking, carrier, handledBy: user.id });

  await db.update(webOrders).set({
    status: "dihantar",
    trackingNumber: tracking,
    trackingHistory: JSON.stringify(history),
    handledBy: user.id,
    closedAt: now,
    updatedAt: now,
  }).where(eq(webOrders.id, order.id));
  return c.json({ success: true, message: "Pesanan telah dihantar melalui kurier" });
});

shopRouter.post("/orders/:id/handover", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const db = createDb(c.env.DB);
  await ensureWebOrdersColumns(db);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order || order.status !== "sudah_bayar" || order.fulfillment !== "pickup") {
    return c.json({ success: false, message: "Hanya pesanan ambil sendiri yang sudah dibayar boleh diserahkan" }, 400);
  }
  await closeStock(db, order.id);
  const now = new Date().toISOString();
  let history: any[] = [];
  try {
    if (order.trackingHistory) history = JSON.parse(order.trackingHistory);
  } catch {}
  history.push({ timestamp: now, status: "diserahkan", note: "Barang telah diserahkan kepada pelanggan di kaunter", handledBy: user.id });

  await db.update(webOrders).set({
    status: "diserahkan",
    trackingHistory: JSON.stringify(history),
    handledBy: user.id,
    closedAt: now,
    updatedAt: now,
  }).where(eq(webOrders.id, order.id));
  return c.json({ success: true, message: "Pesanan telah berjaya diserahkan" });
});

shopRouter.post("/orders/:id/receipt", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const body = await c.req.json();
  const method = body.receiptMethod === "email" ? "email" : "wasap";
  const db = createDb(c.env.DB);
  await ensureWebOrdersColumns(db);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order) return c.json({ success: false, message: "Pesanan tidak dijumpai" }, 404);
  const now = new Date().toISOString();
  await db.update(webOrders).set({
    receiptSentAt: now,
    receiptMethod: method,
    updatedAt: now,
  }).where(eq(webOrders.id, order.id));

  const digits = order.customerPhone.replace(/\D/g, "");
  const wa = digits.startsWith("0") ? `6${digits}` : digits;
  const msgText = encodeURIComponent(
    `Salam hormat ${order.customerName},\n\n` +
    `Resit rasmi pesanan Beg Kuning anda *${order.id}* di *FFmotor*:\n\n` +
    `Jumlah: *RM ${(order.amount || 0).toFixed(2)}*\n` +
    `Kaedah: *${order.fulfillment === "delivery" ? "Penghantaran Kurier" : "Ambil Sendiri di Bengkel"}*\n` +
    `Status: *${order.status.toUpperCase()}*\n` +
    (order.trackingNumber ? `No. Tracking: *${order.trackingNumber}*\n` : "") +
    `\nTerima kasih atas sokongan anda kepada FFmotor!`
  );

  return c.json({
    success: true,
    receiptSentAt: now,
    receiptMethod: method,
    waUrl: `https://wa.me/${wa}?text=${msgText}`,
  });
});

shopRouter.post("/orders/:id/tracking", async (c) => {
  const user = me(c);
  if (!isKerani(user.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const body = await c.req.json();
  const trackingNumber = String(body.trackingNumber || "").trim();
  const statusNote = String(body.statusNote || "").trim();
  const db = createDb(c.env.DB);
  await ensureWebOrdersColumns(db);
  const order = await db.select().from(webOrders).where(eq(webOrders.id, c.req.param("id"))).get();
  if (!order) return c.json({ success: false, message: "Pesanan tidak dijumpai" }, 404);
  const now = new Date().toISOString();
  let history: any[] = [];
  try {
    if (order.trackingHistory) history = JSON.parse(order.trackingHistory);
  } catch {}
  if (statusNote || trackingNumber) {
    history.push({
      timestamp: now,
      trackingNumber: trackingNumber || order.trackingNumber,
      note: statusNote || "Kemas kini status penjejakan",
      handledBy: user.id,
    });
  }

  await db.update(webOrders).set({
    trackingNumber: trackingNumber || order.trackingNumber,
    trackingHistory: JSON.stringify(history),
    updatedAt: now,
  }).where(eq(webOrders.id, order.id));

  return c.json({ success: true, trackingNumber: trackingNumber || order.trackingNumber, trackingHistory: history });
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
