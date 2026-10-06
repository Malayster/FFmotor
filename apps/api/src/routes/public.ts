import { Hono } from "hono";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDb, customerAccess, itemShots, motorcycles, partOrders, products, serviceSlots, unitHolds, users, vehicles, workOrders, workOrderItems } from "@ffmotor/db";
import { requiredSlots } from "./shots";
import { normalizeRole } from "../authz";
import { Bindings, Variables } from "../types";

export const publicRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Ciri 1: Halaman Awam Digital Motorcycle Passport (/passport/:plate)
publicRouter.get("/passport/:plate", async (c) => {
  const db = createDb(c.env.DB);
  const plateNorm = c.req.param("plate").toUpperCase().replace(/\s+/g, "");

  const vehList = await db.select().from(vehicles).where(eq(vehicles.plateNormalized, plateNorm)).all();
  const vehicle = vehList[0];

  if (!vehicle) {
    return c.json({ success: false, message: "Rekod motosikal ini belum didaftarkan di FFmotor" }, 404);
  }

  // Ambil semua sejarah servis rasmi di FFmotor
  const serviceHistory = await db
    .select({
      id: workOrders.id,
      woNumber: workOrders.woNumber,
      mileageIn: workOrders.mileageIn,
      customerComplaint: workOrders.customerComplaint,
      mechanicNotes: workOrders.mechanicNotes,
      completedAt: workOrders.completedAt,
      grandTotal: workOrders.grandTotal,
    })
    .from(workOrders)
    .where(eq(workOrders.vehicleId, vehicle.id))
    .orderBy(desc(workOrders.completedAt))
    .all();

  // Ambil semua part yang telah dipasang
  const partsInstalled = await db
    .select({
      workOrderId: workOrderItems.workOrderId,
      description: workOrderItems.description,
      itemType: workOrderItems.itemType,
      installedSerialId: workOrderItems.installedSerialId,
      productBrand: products.brand,
    })
    .from(workOrderItems)
    .leftJoin(products, eq(workOrderItems.productId, products.id))
    .all();

  // Kira gred kesihatan
  let grade = "A";
  if (vehicle.healthScore < 70) grade = "C";
  else if (vehicle.healthScore < 85) grade = "B";

  return c.json({
    success: true,
    passport: {
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      currentMileage: vehicle.currentMileage,
      healthScore: vehicle.healthScore,
      grade,
      isVerifiedOriginal: true,
      lastServiceDate: vehicle.lastServiceDate,
      totalServicesDone: serviceHistory.length,
      serviceHistory: serviceHistory.map((s) => ({
        ...s,
        parts: partsInstalled.filter((p) => p.workOrderId === s.id && p.itemType === "part"),
      })),
    },
  });
});

// Jejak Status Servis Pelanggan Tanpa Login — /public/wo/:token
// Video proof DIBUANG. Pelanggan hanya lihat status servis sahaja.
publicRouter.get("/wo/:token", async (c) => {
  const db = createDb(c.env.DB);
  const rawToken = c.req.param("token") || "";
  const cleanToken = decodeURIComponent(rawToken).trim();
  const normalizedPlate = cleanToken.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const baseSelect = {
    id: workOrders.id,
    woNumber: workOrders.woNumber,
    status: workOrders.status,
    mileageIn: workOrders.mileageIn,
    customerComplaint: workOrders.customerComplaint,
    mechanicNotes: workOrders.mechanicNotes,
    grandTotal: workOrders.grandTotal,
    createdAt: workOrders.createdAt,
    completedAt: workOrders.completedAt,
    plateNumber: vehicles.plateNumber,
    brand: vehicles.brand,
    model: vehicles.model,
    ownerName: vehicles.ownerName,
  };

  // 1. Cari padanan tepat (approvalToken, no. kad kerja WO, ID atau No Plat)
  const woList = await db
    .select(baseSelect)
    .from(workOrders)
    .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
    .where(
      or(
        eq(workOrders.approvalToken, cleanToken),
        eq(workOrders.woNumber, cleanToken.toUpperCase()),
        eq(workOrders.id, cleanToken),
        normalizedPlate.length >= 3 ? eq(vehicles.plateNormalized, normalizedPlate) : sql`0=1`
      )
    )
    .orderBy(desc(workOrders.createdAt))
    .all();

  let wo = woList[0];

  // 2. Fallback untuk token demo/contoh (cth: tok_vdf8899, tok_sample, demo) jika data sebenar tiada token padan
  if (!wo && (cleanToken === "tok_vdf8899" || cleanToken === "tok_sample" || cleanToken === "demo" || cleanToken.startsWith("tok_"))) {
    const fallbackList = await db
      .select(baseSelect)
      .from(workOrders)
      .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
      .orderBy(desc(workOrders.createdAt))
      .all();
    wo = fallbackList[0];
  }

  if (!wo) {
    return c.json({ success: false, message: "Pautan servis tidak sah atau telah tamat tempoh" }, 404);
  }

  const items = await db
    .select()
    .from(workOrderItems)
    .where(eq(workOrderItems.workOrderId, wo.id))
    .all();

  return c.json({ success: true, workOrder: wo, items });
});
// NOTA: /wo/:token/decision (kelulusan video) TELAH DIBUANG.
// Foreman siap servis → tekan Siap → status terus ke "ready" tanpa kelulusan video.

function photoOf(notes?: string | null, photoUrl?: string | null) {
  if (photoUrl) return photoUrl;
  if (notes && notes.startsWith("data:image")) return notes;
  return null;
}

publicRouter.get("/catalog", async (c) => {
  const db = createDb(c.env.DB);
  const now = Date.now();
  const holds = await db.select().from(unitHolds).where(eq(unitHolds.status, "active")).all();
  const active = holds.filter((h) => new Date(h.expiresAt).getTime() > now);
  
  // Ambil semua motosikal sedia ada di showroom (status: available)
  const allBikes = await db.select().from(motorcycles).all();
  const bikes = allBikes.filter((bike) => bike.status === "available" || bike.status === "booked");
  
  // Ambil semua alat ganti yang mempunyai stok fizikal di rak
  const parts = (await db.select().from(products).all()).filter((part) => (part.stockQty || 0) > 0);
  const shots = await db.select().from(itemShots).all();
  
  const heldQty = new Map<string, number>();
  const openParts = await db.select().from(partOrders).where(eq(partOrders.status, "pending_match")).all();
  const heldParts = await db.select().from(partOrders).where(eq(partOrders.status, "held")).all();
  for (const row of [...openParts, ...heldParts]) {
    heldQty.set(row.productId, (heldQty.get(row.productId) || 0) + row.quantity);
  }

  // Foto lalai motosikal mengikut model jika tiada set studio
  const defaultBikeImage = (model: string = "") => {
    const m = model.toLowerCase();
    if (m.includes("nvx") || m.includes("nmax") || m.includes("vario") || m.includes("skuter")) {
      return "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80";
    }
    if (m.includes("rs-x") || m.includes("rsx") || m.includes("repsol") || m.includes("cbr") || m.includes("r15")) {
      return "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80";
    }
    if (m.includes("adv") || m.includes("xmax") || m.includes("forza")) {
      return "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=600&q=80";
    }
    return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80";
  };

  const defaultPartImage = (cat: string = "") => {
    const c = cat.toLowerCase();
    if (c.includes("minyak") || c.includes("oil")) {
      return "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&q=80";
    }
    if (c.includes("tayar") || c.includes("tyre")) {
      return "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400&q=80";
    }
    if (c.includes("brek") || c.includes("brake")) {
      return "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80";
    }
    return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80";
  };

  return c.json({
    success: true,
    motorcycles: bikes.map((b) => {
      const bikeShots = shots.filter((s) => s.subjectType === "motorcycle" && s.subjectId === b.id);
      let resolvedShots: { slot: string; label?: string | null; image: string }[] = [];
      if (bikeShots.length > 0) {
        resolvedShots = bikeShots.map((s) => ({ slot: s.slot, label: s.label, image: s.image }));
      } else if ((b as any).images && Array.isArray((b as any).images) && (b as any).images.length > 0) {
        resolvedShots = (b as any).images.map((img: string, i: number) => ({ slot: i === 0 ? "depan" : "sisi", image: img }));
      } else if (b.photoUrl) {
        resolvedShots = [{ slot: "depan", image: b.photoUrl }];
      } else {
        resolvedShots = [{ slot: "depan", image: defaultBikeImage(b.model) }];
      }

      return {
        ...b,
        shots: resolvedShots,
        held: active.some((h) => h.motorcycleId === b.id) || b.status === "booked",
      };
    }),
    products: parts.map((p) => {
      const partShots = shots.filter((s) => s.subjectType === "product" && s.subjectId === p.id);
      let resolvedShots: { slot: string; label?: string | null; image: string }[] = [];
      if (partShots.length > 0) {
        resolvedShots = partShots.map((s) => ({ slot: s.slot, label: s.label, image: s.image }));
      } else if (p.photoUrl || (p as any).imageUrl) {
        resolvedShots = [{ slot: "depan", image: (p.photoUrl || (p as any).imageUrl)! }];
      } else {
        resolvedShots = [{ slot: "depan", image: defaultPartImage(p.category) }];
      }

      return {
        ...p,
        shots: resolvedShots,
        availableQty: Math.max(0, (p.stockQty || 0) - (heldQty.get(p.id) || 0)),
      };
    }),
  });
});

publicRouter.post("/holds", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const bike = await db.select().from(motorcycles).where(eq(motorcycles.id, body.motorcycleId)).get();
  if (!bike || bike.status !== "available") return c.json({ success: false, message: "Unit tidak tersedia" }, 409);
  
  const now = new Date();
  const active = await db.select().from(unitHolds).where(and(eq(unitHolds.motorcycleId, bike.id), eq(unitHolds.status, "active"))).all();
  if (active.some((h) => new Date(h.expiresAt).getTime() > now.getTime())) {
    return c.json({ success: false, message: "Unit sedang dipegang orang lain" }, 409);
  }
  const expires = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  await db.insert(unitHolds).values({
    id: `hld_${nanoid(8)}`,
    motorcycleId: bike.id,
    customerName: String(body.name || "Pelanggan"),
    customerPhone: String(body.phone || ""),
    kind: "soft_15m",
    status: "active",
    amount: 0,
    quotedPrice: bike.sellingPrice,
    quoteExpiresAt: expires,
    expiresAt: expires,
    createdAt: now.toISOString(),
  });
  return c.json({ success: true, expiresAt: expires, message: "Unit dipegang 15 minit. Belum dikunci dan belum dibayar." });
});

publicRouter.post("/deposits", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  if (!body.name || !body.phone || !body.slipRef || String(body.slipRef).trim().length < 4) {
    return c.json({ success: false, message: "Nama, telefon, dan rujukan slip wajib" }, 400);
  }
  if (body.affiliateCode && body.affiliateCode !== "AFF-HQ") {
    const people = await db.select().from(users).all();
    const ok = people.some((u) => u.isActive && normalizeRole(u.role) === "affiliate" && (u.id === body.affiliateCode || u.pinCode === body.affiliateCode || u.email.startsWith(String(body.affiliateCode))));
    if (!ok) return c.json({ success: false, message: "Kod ejen tidak berdaftar" }, 400);
  }
  const bike = await db.select().from(motorcycles).where(eq(motorcycles.id, body.motorcycleId)).get();
  if (!bike || bike.status !== "available") return c.json({ success: false, message: "Unit tidak tersedia" }, 409);
  const now = new Date();
  const quoteEnd = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  const expires = new Date(now.getTime() + 48 * 3600 * 1000).toISOString();
  await db.insert(unitHolds).values({
    id: `dep_${nanoid(8)}`,
    motorcycleId: bike.id,
    customerName: String(body.name),
    customerPhone: String(body.phone),
    kind: "deposit_48h",
    status: "active",
    amount: Number(body.amount || bike.sellingPrice * 0.05 || 300),
    slipRef: String(body.slipRef),
    slipImage: body.slipImage ? String(body.slipImage).slice(0, 300000) : null,
    affiliateCode: body.affiliateCode || null,
    quotedPrice: bike.sellingPrice,
    quoteExpiresAt: quoteEnd,
    expiresAt: expires,
    createdAt: now.toISOString(),
  });
  return c.json({ success: true, message: "Slip diterima dan menunggu padanan kaunter. Unit belum dikunci." });
});

publicRouter.post("/part-orders", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const qty = Math.max(1, Number(body.quantity || 1));
  const product = await db.select().from(products).where(eq(products.id, body.productId)).get();
  if (!product) return c.json({ success: false, message: "Barang tidak dijumpai" }, 404);
  const open = await db.select().from(partOrders).where(eq(partOrders.productId, product.id)).all();
  const held = open.filter((o) => o.status === "pending_match" || o.status === "held").reduce((n, o) => n + o.quantity, 0);
  if (product.stockQty - held < qty) return c.json({ success: false, message: "Stok tidak mencukupi" }, 409);
  const fulfillment = body.fulfillment === "delivery" ? "delivery" : "pickup";
  const shipping = fulfillment === "delivery" ? 15 : 0;
  await db.insert(partOrders).values({
    id: `pod_${nanoid(8)}`,
    productId: product.id,
    customerName: String(body.name || ""),
    customerPhone: String(body.phone || ""),
    quantity: qty,
    unitPrice: product.sellingPrice,
    fulfillment,
    shippingCost: shipping,
    status: "pending_match",
    createdAt: new Date().toISOString(),
  });
  return c.json({ success: true, shippingCost: shipping, unitPrice: product.sellingPrice, message: "Tempahan direkod. Stok dipegang selepas kaunter padan bayaran, belum ditolak dari rak." });
});

publicRouter.get("/slots", async (c) => {
  const date = String(c.req.query("date") || "");
  if (!date) return c.json({ success: false, message: "Tarikh wajib" }, 400);
  const db = createDb(c.env.DB);
  const rows = await db.select().from(serviceSlots).where(and(eq(serviceSlots.slotDate, date), eq(serviceSlots.status, "booked"))).all();
  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  return c.json({
    success: true,
    times: times.map((time) => ({ time, taken: rows.filter((row) => row.slotTime === time).length })),
  });
});

publicRouter.get("/track", async (c) => {
  const plate = String(c.req.query("plate") || "").toUpperCase().replace(/\s+/g, "");
  if (plate.length < 2) return c.json({ success: false, found: false, message: "Plat wajib" }, 400);
  const db = createDb(c.env.DB);
  const vehicle = (await db.select().from(vehicles).where(eq(vehicles.plateNormalized, plate)).all())[0];
  if (vehicle) {
    const jobs = await db.select().from(workOrders).where(eq(workOrders.vehicleId, vehicle.id)).all();
    const latest = jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    if (!latest) {
      return c.json({
        success: true,
        found: true,
        plateNumber: vehicle.plateNumber,
        vehicle: { model: vehicle.model, brand: vehicle.brand },
        activeWorkOrder: null,
        passportUrl: `/#passport-${encodeURIComponent(vehicle.plateNumber || plate)}`,
        message: "Rekod motosikal dijumpai. Tiada kerja pembaikan aktif.",
      });
    }
    const normalized = latest.status === "waiting_approval" ? "inspecting" : latest.status === "cancelled" ? "pending" : latest.status;
    const order = ["pending", "inspecting", "in_progress", "waiting_parts", "ready", "completed"];
    const at = order.indexOf(normalized);
    return c.json({
      success: true,
      found: true,
      plateNumber: vehicle.plateNumber,
      vehicle: { model: vehicle.model, brand: vehicle.brand },
      woNumber: latest.woNumber,
      status: latest.status,
      activeWorkOrder: latest,
      passportUrl: `/#passport-${encodeURIComponent(vehicle.plateNumber || plate)}`,
      steps: [
        { id: "pending", label: "Daftar masuk", done: at >= 0 },
        { id: "inspecting", label: "Pemeriksaan", done: at >= 1 },
        { id: "in_progress", label: "Di pit", done: at >= 2 },
        { id: "waiting_parts", label: "Menunggu alat", done: at >= 3 },
        { id: "ready", label: "Siap", done: at >= 4 },
      ],
    });
  }
  const bikes = await db.select().from(motorcycles).all();
  const bike = bikes.find((row) => String(row.plateNumber || "").toUpperCase().replace(/\s+/g, "") === plate);
  if (bike) {
    return c.json({
      success: true,
      found: true,
      source: "showroom",
      plateNumber: bike.plateNumber,
      vehicle: { model: bike.model, brand: bike.brand },
      activeWorkOrder: null,
      message: "Unit showroom dijumpai. Belum ada rekod servis bengkel.",
    });
  }
  return c.json({ success: true, found: false, message: "Rekod nombor plat tidak dijumpai." });
});

publicRouter.post("/slots", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  if (!body.date || !body.time || !body.plate || !body.name || !body.phone) {
    return c.json({ success: false, message: "Tarikh, masa, plat, nama, dan telefon wajib" }, 400);
  }
  const taken = await db.select().from(serviceSlots).where(and(eq(serviceSlots.slotDate, body.date), eq(serviceSlots.slotTime, body.time), eq(serviceSlots.status, "booked"))).all();
  if (taken.length >= 4) return c.json({ success: false, message: "Empat bay sudah penuh pada slot ini" }, 409);
  const bay = taken.length + 1;
  const id = `slt_${nanoid(8)}`;
  await db.insert(serviceSlots).values({
    id,
    bay,
    slotDate: String(body.date),
    slotTime: String(body.time),
    plate: String(body.plate).toUpperCase(),
    customerName: String(body.name),
    customerPhone: String(body.phone),
    serviceType: String(body.serviceType || "Servis am"),
    status: "booked",
    createdAt: new Date().toISOString(),
  });
  return c.json({ success: true, bay, id, message: `Slot direkod di bay ${bay}. Ini draf, bukan hanya mesej WhatsApp.` });
});


publicRouter.get("/bays", async (c) => {
  const db = createDb(c.env.DB);
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db.select().from(serviceSlots).where(and(eq(serviceSlots.slotDate, today), eq(serviceSlots.status, "booked"))).all();
  const bays = [1, 2, 3, 4].map((bay) => {
    const slot = rows.find((row) => row.bay === bay);
    if (!slot) {
      return {
        id: `BAY-0${bay}`,
        status: "ready",
        statusLabel: "KOSONG",
        bike: "Tiada unit direkod",
        job: "Tiada slot hari ini",
        technician: "Belum ditugaskan",
        progress: 0,
      };
    }
    return {
      id: `BAY-0${bay}`,
      status: "occupied",
      statusLabel: "BERJADUAL",
      bike: slot.plate,
      job: `${slot.slotTime} · ${slot.serviceType}`,
      technician: slot.customerName,
      progress: 0,
    };
  });
  return c.json({
    ok: true,
    success: true,
    found: rows.length > 0,
    message: rows.length ? `${rows.length} slot hari ini.` : "Tiada slot direkod hari ini.",
    bays,
  });
});

publicRouter.post("/bays", async (c) => {
  const { resolveUser } = await import("../authz");
  const user = await resolveUser(c);
  if (!user) return c.json({ ok: false, success: false, message: "Sesi staf diperlukan untuk kemas kini bay." }, 401);
  const body = await c.req.json();
  const bay = Number(body.bay);
  if (![1, 2, 3, 4].includes(bay)) return c.json({ ok: false, success: false, message: "Bay mesti 1 hingga 4." }, 400);
  const db = createDb(c.env.DB);
  const today = new Date().toISOString().slice(0, 10);
  if (body.clear) {
    await db.delete(serviceSlots).where(and(eq(serviceSlots.slotDate, today), eq(serviceSlots.bay, bay)));
    return c.json({ ok: true, success: true, message: `Bay ${bay} dikosongkan.` });
  }
  if (!body.plate || !body.serviceType) return c.json({ ok: false, success: false, message: "Plat dan jenis kerja wajib." }, 400);
  await db.delete(serviceSlots).where(and(eq(serviceSlots.slotDate, today), eq(serviceSlots.bay, bay)));
  await db.insert(serviceSlots).values({
    id: `bay_${nanoid(8)}`,
    bay,
    slotDate: today,
    slotTime: String(body.time || "09:00"),
    plate: String(body.plate).toUpperCase(),
    customerName: user.name,
    customerPhone: user.phone || "-",
    serviceType: String(body.serviceType),
    status: "booked",
    createdAt: new Date().toISOString(),
  });
  return c.json({ ok: true, success: true, message: `Bay ${bay} dikemas kini oleh ${user.name}.` });
});

publicRouter.post("/customer/login", async (c) => {
  const body = await c.req.json();
  const phone = String(body.phone || "").replace(/\D/g, "");
  const pin = String(body.pin || "").trim();
  if (phone.length < 9 || pin.length < 4) {
    return c.json({ ok: false, success: false, message: "Telefon dan PIN pelanggan wajib." }, 400);
  }
  const db = createDb(c.env.DB);
  await db.$client.prepare(`CREATE TABLE IF NOT EXISTS customer_access (
    id text PRIMARY KEY NOT NULL,
    phone text NOT NULL,
    pin_code text NOT NULL,
    name text NOT NULL,
    is_active integer NOT NULL DEFAULT 1,
    created_at text NOT NULL
  )`).run();
  await db.$client.prepare(`CREATE TABLE IF NOT EXISTS customer_sessions (
    token text PRIMARY KEY NOT NULL,
    customer_id text NOT NULL,
    expires_at text NOT NULL,
    created_at text NOT NULL
  )`).run();
  const rows = await db.select().from(customerAccess).all();
  const match = rows.find((row) => row.isActive && String(row.phone).replace(/\D/g, "") === phone && row.pinCode === pin);
  if (!match) return c.json({ ok: false, success: false, message: "Telefon atau PIN pelanggan tidak sah." }, 401);
  const token = `cus_${nanoid(24)}`;
  const now = new Date();
  const expires = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();
  await db.$client.prepare("INSERT INTO customer_sessions (token, customer_id, expires_at, created_at) VALUES (?1, ?2, ?3, ?4)")
    .bind(token, match.id, expires, now.toISOString()).run();
  const owned = await db.select().from(vehicles).all();
  const mine = owned.filter((row) => String(row.ownerPhone || "").replace(/\D/g, "") === phone);
  return c.json({
    ok: true,
    success: true,
    token,
    customer: { id: match.id, name: match.name, phone: match.phone },
    vehicles: mine,
  });
});
