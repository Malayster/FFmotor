import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  arahan,
  createDb,
  distributorClaims,
  mechanicCommissions,
  motorcycles,
  motorSales,
  partOrders,
  products,
  priceChanges,
  unitHolds,
  users,
  workOrders,
} from "@ffmotor/db";
import { Bindings, Variables } from "../types";
import { normalizeRole, StaffSession } from "../authz";

export const ownerRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();
export const deskRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

function session(c: { get: (k: "user") => StaffSession | undefined }): StaffSession {
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

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

ownerRouter.get("/board", async (c) => {
  const db = createDb(c.env.DB);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const [orders, sales, bikes, claims, commissions, holds, parts, changes, jobs, allProducts] = await Promise.all([
    db.select().from(workOrders).all(),
    db.select().from(motorSales).all(),
    db.select().from(motorcycles).all(),
    db.select().from(distributorClaims).all(),
    db.select().from(mechanicCommissions).all(),
    db.select().from(unitHolds).all(),
    db.select().from(partOrders).all(),
    db.select().from(priceChanges).orderBy(desc(priceChanges.createdAt)).limit(30).all(),
    db.select().from(arahan).orderBy(desc(arahan.createdAt)).limit(30).all(),
    db.select().from(products).all(),
  ]);

  const paidToday = orders.filter((o) => o.paymentStatus === "paid" && (o.completedAt || o.createdAt).startsWith(today));
  const salesToday = sales.filter((s) => s.soldAt.startsWith(today));
  const wangHari = paidToday.reduce((n, o) => n + o.grandTotal, 0) + salesToday.reduce((n, s) => n + s.salePrice, 0);
  const paidMonth = orders.filter((o) => o.paymentStatus === "paid" && (o.completedAt || o.createdAt).startsWith(month));
  const salesMonth = sales.filter((s) => s.soldAt.startsWith(month));
  const wangBulan = paidMonth.reduce((n, o) => n + o.grandTotal, 0) + salesMonth.reduce((n, s) => n + s.salePrice, 0);

  const servis = paidMonth.reduce((n, o) => n + o.totalLaborAmount, 0);
  const alat = paidMonth.reduce((n, o) => n + o.totalPartsAmount, 0);
  const bikeById = new Map(bikes.map((b) => [b.id, b]));
  const marginMotor = salesMonth.reduce((n, s) => n + (s.salePrice - (bikeById.get(s.motorcycleId)?.costPrice || 0)), 0);
  const tuntutanDiterima = claims.filter((x) => x.status === "received" && (x.receivedAt || "").startsWith(month)).reduce((n, x) => n + x.amount, 0);
  const tuntutanBelum = claims.filter((x) => x.status === "accrued").reduce((n, x) => n + x.amount, 0);
  const komisenKeluar = commissions.filter((x) => x.createdAt.startsWith(month)).reduce((n, x) => n + x.commissionAmount, 0);
  const bersih = servis + alat + marginMotor + tuntutanDiterima - komisenKeluar;

  // Ringkasan Inventori Motosikal Showroom
  const ringkasanMotor = {
    total: bikes.length,
    tersedia: bikes.filter((b) => b.status === "available").length,
    ditempah: holds.filter((h) => h.status === "active" && h.kind === "deposit_48h").length,
    loanPending: bikes.filter((b) => b.status === "loan_pending").length,
    terjual: bikes.filter((b) => b.status === "sold").length,
  };

  // Ringkasan Inventori Alat Ganti Stor
  const ringkasanStok = {
    totalItem: allProducts.length,
    nilaiStok: allProducts.reduce((n, p) => n + (p.stockQty * p.costPrice), 0),
    bakiSihat: allProducts.filter((p) => p.stockQty > p.minAlertQty).length,
    kritikal: allProducts.filter((p) => p.stockQty <= p.minAlertQty).length,
  };

  // Ringkasan Pit Bengkel (Masa Nyata)
  const ringkasanPit = {
    total: orders.length,
    aktif: orders.filter((o) => o.status === "in_progress").length,
    tungguAlat: orders.filter((o) => o.status === "waiting_parts").length,
    siap: orders.filter((o) => o.status === "ready").length,
    selesai: orders.filter((o) => o.status === "completed").length,
  };

  const masalah: { id: string; label: string; targetRole: string }[] = [];
  for (const b of bikes) {
    if (b.status !== "sold" && b.sellingPrice < b.costPrice) {
      masalah.push({ id: `price-${b.id}`, label: `${b.model} dijual bawah kos (RM ${b.sellingPrice} < RM ${b.costPrice})`, targetRole: "owner" });
    }
    if (b.status !== "sold" && b.listingStatus !== "dijual") {
      const target = b.listingStatus === "menunggu_foreman" ? "foreman" : b.listingStatus === "menunggu_harga" ? "owner" : "kerani_1";
      masalah.push({ id: `photo-${b.id}`, label: `${b.model} set sudut belum dijual (${b.listingStatus})`, targetRole: target });
    }
  }
  for (const h of holds) {
    if (h.status === "active" && h.kind === "deposit_48h") {
      masalah.push({ id: h.id, label: `Slip ${h.slipRef || "tanpa rujukan"} menunggu padanan · ${h.customerName}`, targetRole: "kerani_1" });
    }
  }
  for (const p of parts) {
    if (p.status === "pending_match") {
      masalah.push({ id: p.id, label: `Tempahan alat ganti ${p.customerName} menunggu padanan`, targetRole: "kerani_2" });
    }
  }
  // NOTA: Amaran "Pelanggan tolak video" DIBUANG — tiada video proof dalam sistem.
  for (const o of orders) {
    if (o.status === "waiting_parts") {
      masalah.push({ id: o.id, label: `Servis ${o.woNumber} menunggu alat ganti daripada stor`, targetRole: "kerani_2" });
    }
  }

  const tergendala: { id: string; label: string; targetRole: string }[] = [];
  const hour48 = now.getTime() - 48 * 3600 * 1000;
  for (const h of holds) {
    if (h.status === "active" && h.kind === "deposit_48h" && new Date(h.createdAt).getTime() < hour48) {
      tergendala.push({ id: `late-${h.id}`, label: `Deposit ${h.customerName} melebihi 48 jam`, targetRole: "kerani_1" });
    }
  }
  for (const b of bikes) {
    if (b.status === "loan_pending") tergendala.push({ id: `loan-${b.id}`, label: `Pinjaman tergantung: ${b.model}`, targetRole: "affiliate" });
  }
  for (const s of sales) {
    if (s.status === "pending_jpj") tergendala.push({ id: `jpj-${s.id}`, label: `JPJ belum serah · ${s.customerName}`, targetRole: "affiliate" });
  }
  for (const p of parts) {
    if (p.status === "held" && p.fulfillment === "delivery" && !p.trackingNumber) {
      tergendala.push({ id: `awb-${p.id}`, label: `Alat ganti ${p.customerName} dipegang tanpa AWB`, targetRole: "kerani_2" });
    }
  }

  const aktiviti = [
    ...changes.map((x) => ({ at: x.createdAt, text: `Harga ditukar RM ${x.oldPrice} → RM ${x.newPrice}` })),
    ...holds.map((x) => ({ at: x.createdAt, text: `${x.kind === "deposit_48h" ? "Deposit" : "Pegangan"} ${x.customerName}` })),
    ...jobs.map((x) => ({ at: x.createdAt, text: `Arahan ke ${x.targetRole === "kerani_1" ? "kerani kaunter" : x.targetRole === "kerani_2" ? "kerani stor" : x.targetRole === "foreman" ? "foreman" : x.targetRole === "affiliate" ? "jurujual" : "pemilik"}: ${x.title}` })),
    ...sales.map((x) => ({ at: x.soldAt, text: `Jualan ${x.customerName} RM ${x.salePrice}` })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);

  return c.json({
    success: true,
    wang: { hariIni: wangHari, bulanIni: wangBulan },
    untung: { servis, alat, marginMotor, tuntutanDiterima, tuntutanBelum, komisenKeluar, bersih },
    ringkasanMotor,
    ringkasanStok,
    ringkasanPit,
    masalah,
    tergendala,
    aktiviti,
    hari: today,
  });
});

ownerRouter.get("/motorcycles", async (c) => {
  const db = createDb(c.env.DB);
  const q = (c.req.query("q") || "").replace(/\s/g, "").toUpperCase();
  const rows = await db.select().from(motorcycles).all();
  const sales = await db.select().from(motorSales).all();
  const filtered = rows.filter((b) => b.listingStatus === "menunggu_harga" || b.listingStatus === "dijual").filter((b) => {
    if (!q) return true;
    const plate = (b.plateNumber || "").replace(/\s/g, "").toUpperCase();
    const chassis = b.chassisNo.replace(/\s/g, "").toUpperCase();
    const soldPlate = sales.find((s) => s.motorcycleId === b.id)?.assignedPlateNumber?.replace(/\s/g, "").toUpperCase() || "";
    return plate.includes(q) || chassis.includes(q) || soldPlate.includes(q) || b.model.toUpperCase().includes(q);
  });
  const partRows = await db.select().from(products).all();
  const parts = partRows.filter((p) => p.listingStatus === "menunggu_harga" || p.listingStatus === "dijual");
  return c.json({ success: true, motorcycles: filtered, products: parts });
});

ownerRouter.patch("/products/:id/price", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const price = Number(body.sellingPrice);
  if (!Number.isFinite(price) || price < 0) return c.json({ success: false, message: "Harga tidak sah" }, 400);
  const part = await db.select().from(products).where(eq(products.id, id)).get();
  if (!part) return c.json({ success: false, message: "Barang tidak dijumpai" }, 404);
  if (part.listingStatus !== "menunggu_harga" && part.listingStatus !== "dijual") {
    return c.json({ success: false, message: "Foreman belum sahkan set gambar barang ini" }, 400);
  }
  await db.update(products).set({ sellingPrice: price, listingStatus: "dijual", listingNote: null, updatedAt: new Date().toISOString() }).where(eq(products.id, id));
  return c.json({ success: true, belowCost: price < part.costPrice });
});

ownerRouter.patch("/motorcycles/:id/price", async (c) => {
  const db = createDb(c.env.DB);
  const me = session(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const price = Number(body.sellingPrice);
  const plate = typeof body.plateNumber === "string" ? body.plateNumber.trim().toUpperCase() : undefined;
  if (!Number.isFinite(price) || price < 0) return c.json({ success: false, message: "Harga tidak sah" }, 400);
  const bike = await db.select().from(motorcycles).where(eq(motorcycles.id, id)).get();
  if (!bike) return c.json({ success: false, message: "Motor tidak dijumpai" }, 404);
  if (bike.listingStatus !== "menunggu_harga" && bike.listingStatus !== "dijual") {
    return c.json({ success: false, message: "Foreman belum sahkan set gambar motor ini" }, 400);
  }
  const now = new Date().toISOString();
  await db.update(motorcycles).set({
    sellingPrice: price,
    plateNumber: plate ?? bike.plateNumber,
    listingStatus: "dijual",
    listingNote: null,
  }).where(eq(motorcycles.id, id));
  await db.insert(priceChanges).values({
    id: `prc_${nanoid(8)}`,
    motorcycleId: id,
    oldPrice: bike.sellingPrice,
    newPrice: price,
    belowCost: price < bike.costPrice,
    changedBy: me.id,
    createdAt: now,
  });
  return c.json({ success: true, belowCost: price < bike.costPrice });
});

ownerRouter.get("/accounts", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(users).all();
  return c.json({
    success: true,
    accounts: rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: normalizeRole(u.role),
      rawRole: u.role,
      isActive: u.isActive,
      photoUrl: u.photoUrl,
      hasPin: Boolean(u.pinCode),
    })),
  });
});

ownerRouter.post("/accounts", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const role = normalizeRole(body.role) as "owner" | "kerani_1" | "kerani_2" | "foreman" | "affiliate";
  if (!["owner", "kerani_1", "kerani_2", "foreman", "affiliate"].includes(role)) {
    return c.json({ success: false, message: "Peranan tidak sah" }, 400);
  }
  if (!body.name || !body.email || !body.pin) return c.json({ success: false, message: "Nama, emel, dan PIN wajib" }, 400);
  if (String(body.photoUrl || "").length > 300000) return c.json({ success: false, message: "Gambar terlalu besar" }, 400);
  const now = new Date().toISOString();
  const id = `usr_${nanoid(8)}`;
  await db.insert(users).values({
    id,
    name: String(body.name),
    email: String(body.email).toLowerCase(),
    passwordHash: String(body.pin),
    pinCode: String(body.pin),
    role,
    phone: body.phone ? String(body.phone) : null,
    photoUrl: body.photoUrl ? String(body.photoUrl) : null,
    isActive: true,
    createdAt: now,
  });
  return c.json({ success: true, id });
});

ownerRouter.patch("/accounts/:id", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();
  const row = await db.select().from(users).where(eq(users.id, id)).get();
  if (!row) return c.json({ success: false, message: "Akaun tidak dijumpai" }, 404);
  if (String(body.photoUrl || "").length > 300000) return c.json({ success: false, message: "Gambar terlalu besar" }, 400);
  const role = (body.role ? normalizeRole(body.role) : normalizeRole(row.role)) as "admin" | "cashier" | "mechanic" | "sales" | "owner" | "kerani_1" | "kerani_2" | "foreman" | "affiliate";
  await db.update(users).set({
    name: body.name ? String(body.name) : row.name,
    phone: body.phone !== undefined ? String(body.phone) : row.phone,
    role,
    photoUrl: body.photoUrl !== undefined ? (body.photoUrl || null) : row.photoUrl,
    pinCode: body.pin ? String(body.pin) : row.pinCode,
    passwordHash: body.pin ? String(body.pin) : row.passwordHash,
  }).where(eq(users.id, id));
  return c.json({ success: true });
});

ownerRouter.post("/accounts/:id/deactivate", async (c) => {
  const db = createDb(c.env.DB);
  const me = session(c);
  const id = c.req.param("id");
  if (id === me.id) return c.json({ success: false, message: "Pemilik tidak boleh nyahaktif diri sendiri" }, 400);
  const row = await db.select().from(users).where(eq(users.id, id)).get();
  if (!row) return c.json({ success: false, message: "Akaun tidak dijumpai" }, 404);
  if (normalizeRole(row.role) === "owner") {
    const owners = await db.select().from(users).all();
    const activeOwners = owners.filter((u) => u.isActive && normalizeRole(u.role) === "owner");
    if (activeOwners.length <= 1) return c.json({ success: false, message: "Akaun pemilik terakhir tidak boleh dipadam" }, 400);
  }
  await db.update(users).set({ isActive: false }).where(eq(users.id, id));
  return c.json({ success: true });
});

ownerRouter.post("/arahan", async (c) => {
  const db = createDb(c.env.DB);
  const me = session(c);
  const body = await c.req.json();
  const target = normalizeRole(body.targetRole);
  if (!body.title || !target) return c.json({ success: false, message: "Tajuk dan peranan wajib" }, 400);
  const now = new Date().toISOString();
  const id = `arh_${nanoid(8)}`;
  await db.insert(arahan).values({
    id,
    title: String(body.title),
    detail: String(body.detail || ""),
    targetRole: target,
    status: "open",
    createdBy: me.id,
    source: String(body.source || "manual"),
    createdAt: now,
  });
  return c.json({ success: true, id });
});

ownerRouter.post("/claims", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();
  const amount = Number(body.amount);
  if (!body.distributor || !Number.isFinite(amount)) return c.json({ success: false, message: "Pengedar dan amaun wajib" }, 400);
  const now = new Date().toISOString();
  await db.insert(distributorClaims).values({
    id: `clm_${nanoid(8)}`,
    distributor: String(body.distributor),
    motorcycleId: body.motorcycleId || null,
    amount,
    status: "accrued",
    note: body.note ? String(body.note) : null,
    createdAt: now,
  });
  return c.json({ success: true });
});

ownerRouter.post("/claims/:id/receive", async (c) => {
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  await db.update(distributorClaims).set({ status: "received", receivedAt: now }).where(eq(distributorClaims.id, c.req.param("id")));
  return c.json({ success: true });
});

deskRouter.get("/arahan", async (c) => {
  const db = createDb(c.env.DB);
  const me = session(c);
  const rows = await db.select().from(arahan).orderBy(desc(arahan.createdAt)).all();
  const mine = me.role === "owner" ? rows : rows.filter((r) => r.targetRole === me.role);
  const people = await db.select().from(users).all();
  return c.json({
    success: true,
    arahan: mine.map((r) => ({
      ...r,
      fromName: people.find((p) => p.id === r.createdBy)?.name || "Pemilik",
      fromPhoto: people.find((p) => p.id === r.createdBy)?.photoUrl || null,
    })),
  });
});

deskRouter.post("/arahan/:id/done", async (c) => {
  const db = createDb(c.env.DB);
  const row = await db.select().from(arahan).where(eq(arahan.id, c.req.param("id"))).get();
  if (!row) return c.json({ success: false, message: "Arahan tidak dijumpai" }, 404);
  await db.update(arahan).set({ status: "done", doneAt: new Date().toISOString() }).where(eq(arahan.id, row.id));
  return c.json({ success: true });
});

deskRouter.get("/deposits", async (c) => {
  const db = createDb(c.env.DB);
  const holds = await db.select().from(unitHolds).where(eq(unitHolds.status, "active")).all();
  const bikes = await db.select().from(motorcycles).all();
  return c.json({
    success: true,
    deposits: holds.filter((h) => h.kind === "deposit_48h").map((h) => ({
      ...h,
      model: bikes.find((b) => b.id === h.motorcycleId)?.model || h.motorcycleId,
    })),
  });
});

deskRouter.post("/deposits/:id/match", async (c) => {
  const db = createDb(c.env.DB);
  const hold = await db.select().from(unitHolds).where(eq(unitHolds.id, c.req.param("id"))).get();
  if (!hold || hold.status !== "active") return c.json({ success: false, message: "Slip tidak menunggu" }, 404);
  await db.update(unitHolds).set({ status: "matched" }).where(eq(unitHolds.id, hold.id));
  await db.update(motorcycles).set({ status: "booked" }).where(and(eq(motorcycles.id, hold.motorcycleId), eq(motorcycles.status, "available")));
  return c.json({ success: true });
});

deskRouter.post("/deposits/:id/reject", async (c) => {
  const db = createDb(c.env.DB);
  await db.update(unitHolds).set({ status: "rejected" }).where(eq(unitHolds.id, c.req.param("id")));
  return c.json({ success: true });
});
