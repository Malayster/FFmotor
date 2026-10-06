import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDb, captureDocs, itemShots, motorcycles, products, vehicles, workOrders } from "@ffmotor/db";
import { Bindings, Variables } from "../types";
import { StaffSession } from "../authz";
import { youtubeId } from "../youtube";

export const shotsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const NEW_BIKE_SLOTS = ["depan", "belakang", "atas", "bawah", "tepi_kiri", "tepi_kanan", "enjin", "warna"] as const;
const USED_BIKE_SLOTS = ["depan", "belakang", "atas", "bawah", "tepi_kiri", "tepi_kanan", "enjin", "warna", "odometer", "keadaan"] as const;
const PRODUCT_SLOTS = ["depan", "belakang", "atas", "bawah", "tepi_kiri", "tepi_kanan", "enjin"] as const;
const SERVICE_SLOTS = ["depan", "belakang", "odometer", "kerosakan", "enjin"] as const;
const DOCUMENT_SLOTS = ["dokumen"] as const;

/** Set baharu tidak sama dengan set terpakai. Warna lain ialah rekod motor lain, bukan slot yang dikongsi. */
export function requiredSlots(subjectType: string, condition?: string | null) {
  if (subjectType === "service") return [...SERVICE_SLOTS];
  if (subjectType === "document") return [...DOCUMENT_SLOTS];
  if (subjectType === "motorcycle" && condition === "used") return [...USED_BIKE_SLOTS];
  if (subjectType === "motorcycle") return [...NEW_BIKE_SLOTS];
  return [...PRODUCT_SLOTS];
}

function isKerani(role: string) {
  return role === "kerani_1" || role === "kerani_2" || role === "owner" || role === "admin";
}

function session(c: { get: (key: "user") => StaffSession | undefined }): StaffSession {
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

function canUpload(role: string, subjectType: string) {
  if (role === "owner" || role === "admin") return true;
  if (subjectType === "service") return role === "foreman" || role === "mechanic";
  if (subjectType === "motorcycle" || subjectType === "product" || subjectType === "document") return isKerani(role);
  return true;
}

async function loadSubject(db: ReturnType<typeof createDb>, subjectType: string, subjectId: string) {
  if (subjectType === "motorcycle") {
    const row = await db.select().from(motorcycles).where(eq(motorcycles.id, subjectId)).get();
    if (!row) return null;
    return { kind: "motorcycle" as const, row };
  }
  if (subjectType === "product") {
    const row = await db.select().from(products).where(eq(products.id, subjectId)).get();
    if (!row) return null;
    return { kind: "product" as const, row };
  }
  if (subjectType === "document") {
    const row = await db.select().from(captureDocs).where(eq(captureDocs.id, subjectId)).get();
    if (!row) return null;
    return { kind: "document" as const, row };
  }
  const row = await db.select().from(workOrders).where(eq(workOrders.id, subjectId)).get();
  if (!row) return null;
  return { kind: "service" as const, row };
}

function filled(shots: { slot: string }[], slots: string[]) {
  return slots.every((slot) => shots.some((shot) => shot.slot === slot));
}

shotsRouter.get("/subjects", async (c) => {
  const me = session(c);
  const db = createDb(c.env.DB);
  const shots = await db.select().from(itemShots).all();
  const bikes = me.role === "foreman" ? [] : await db.select().from(motorcycles).all();
  const parts = me.role === "foreman" ? [] : await db.select().from(products).all();
  const docs = me.role === "foreman" ? [] : await db.select().from(captureDocs).all();
  const jobs = me.role === "foreman"
    ? (await db.select().from(workOrders).all()).filter((job) => job.status !== "completed" && job.status !== "cancelled")
    : [];
  const plates = me.role === "foreman" ? await db.select().from(vehicles).all() : [];
  const bikeRows = bikes
    .map((bike) => ({
      id: bike.id,
      subjectType: "motorcycle" as const,
      title: `${bike.brand} ${bike.model} · ${bike.color}`,
      brand: bike.brand,
      model: bike.model,
      subtitle: `${bike.condition === "used" ? "Terpakai" : "Baharu"} · ${bike.plateNumber || bike.chassisNo}`,
      condition: bike.condition,
      color: bike.color,
      year: bike.year,
      engineNo: bike.engineNo,
      chassisNo: bike.chassisNo,
      plateNumber: bike.plateNumber,
      costPrice: bike.costPrice,
      currentMileage: bike.currentMileage,
      listingStatus: bike.listingStatus,
      listingNote: bike.listingNote,
      need: requiredSlots("motorcycle", bike.condition).length,
      have: shots.filter((shot) => shot.subjectType === "motorcycle" && shot.subjectId === bike.id && shot.slot !== "calar").length,
    }));
  const partRows = parts
    .map((part) => ({
      id: part.id,
      subjectType: "product" as const,
      title: part.name,
      subtitle: part.sku,
      condition: null,
      brand: part.brand,
      category: part.category,
      stockQty: part.stockQty,
      costPrice: part.costPrice,
      rackLocation: part.rackLocation,
      listingStatus: part.listingStatus,
      listingNote: part.listingNote,
      need: requiredSlots("product").length,
      have: shots.filter((shot) => shot.subjectType === "product" && shot.subjectId === part.id && shot.slot !== "calar").length,
    }));
  const docRows = docs.map((doc) => ({
    id: doc.id,
    subjectType: "document" as const,
    title: doc.title,
    subtitle: doc.kind === "resit" ? "Resit" : "Dokumen lain",
    condition: null,
    listingStatus: doc.status,
    listingNote: doc.note,
    need: 1,
    have: shots.filter((shot) => shot.subjectType === "document" && shot.subjectId === doc.id).length,
  }));
  const serviceRows = jobs.map((job) => {
    const vehicle = plates.find((item) => item.id === job.vehicleId);
    return {
      id: job.id,
      subjectType: "service" as const,
      title: `${vehicle?.plateNumber || "Tanpa plat"} · ${vehicle?.model || "Servis"}`,
      subtitle: `${job.woNumber} · ${job.customerComplaint}`,
      condition: "service",
      listingStatus: job.status,
      listingNote: null,
      need: SERVICE_SLOTS.length,
      have: shots.filter((shot) => shot.subjectType === "service" && shot.subjectId === job.id).length,
    };
  });
  return c.json({ success: true, subjects: me.role === "foreman" ? serviceRows : [...bikeRows, ...partRows, ...docRows] });
});

shotsRouter.get("/:subjectType/:subjectId", async (c) => {
  const db = createDb(c.env.DB);
  const subjectType = c.req.param("subjectType");
  const subjectId = c.req.param("subjectId");
  const subject = await loadSubject(db, subjectType, subjectId);
  if (!subject) return c.json({ success: false, message: "Rekod tidak dijumpai" }, 404);
  const shots = await db.select().from(itemShots).where(and(eq(itemShots.subjectType, subjectType as "motorcycle" | "product" | "document" | "service"), eq(itemShots.subjectId, subjectId))).all();
  const condition = subject.kind === "motorcycle" ? subject.row.condition : null;
  const listingStatus = subject.kind === "document" || subject.kind === "service" ? subject.row.status : subject.row.listingStatus;
  const listingNote = subject.kind === "document" ? subject.row.note : subject.kind === "service" ? null : subject.row.listingNote;
  return c.json({
    success: true,
    slots: requiredSlots(subjectType, condition),
    listingStatus,
    listingNote,
    shots: shots.map((shot) => ({ id: shot.id, slot: shot.slot, label: shot.label, image: shot.image })),
  });
});

shotsRouter.post("/", async (c) => {
  const me = session(c);
  const body = await c.req.json();
  const subjectType = String(body.subjectType || "");
  const subjectId = String(body.subjectId || "");
  const slot = String(body.slot || "");
  const image = String(body.image || "");
  if (!canUpload(me.role, subjectType)) return c.json({ success: false, message: "Peranan ini tidak memuat naik set ini" }, 403);
  if (!image.startsWith("data:image") || image.length > 400000) return c.json({ success: false, message: "Gambar tidak sah atau terlalu besar" }, 400);
  const db = createDb(c.env.DB);
  const subject = await loadSubject(db, subjectType, subjectId);
  if (!subject) return c.json({ success: false, message: "Rekod tidak dijumpai" }, 404);
  const allowed = [...requiredSlots(subjectType, subject.kind === "motorcycle" ? subject.row.condition : null), "calar"];
  if (!allowed.includes(slot)) return c.json({ success: false, message: "Sudut tidak dikenali" }, 400);
  const now = new Date().toISOString();
  if (slot === "calar" && body.shotId) {
    await db.update(itemShots).set({ image, uploadedBy: me.id, createdAt: now, label: body.label ? String(body.label) : null }).where(eq(itemShots.id, String(body.shotId)));
  } else if (slot !== "calar") {
    const typed = subjectType as "motorcycle" | "product" | "document" | "service";
    const existing = await db.select().from(itemShots).where(and(eq(itemShots.subjectType, typed), eq(itemShots.subjectId, subjectId), eq(itemShots.slot, slot))).all();
    if (existing[0]) {
      await db.update(itemShots).set({ image, uploadedBy: me.id, createdAt: now, label: body.label ? String(body.label) : null }).where(eq(itemShots.id, existing[0].id));
    } else {
      await db.insert(itemShots).values({ id: `sht_${nanoid(8)}`, subjectType: typed, subjectId, slot, label: body.label ? String(body.label) : null, image, uploadedBy: me.id, createdAt: now });
    }
  } else {
    await db.insert(itemShots).values({ id: `sht_${nanoid(8)}`, subjectType: "motorcycle", subjectId, slot: "calar", label: String(body.label || "Calar"), image, uploadedBy: me.id, createdAt: now });
  }
  if ((subject.kind === "motorcycle" || subject.kind === "product") && subject.row.listingStatus !== "draf") {
    const note = "Gambar diubah. Hantar semula untuk harga.";
    if (subject.kind === "motorcycle") await db.update(motorcycles).set({ listingStatus: "draf", listingNote: note }).where(eq(motorcycles.id, subjectId));
    else await db.update(products).set({ listingStatus: "draf", listingNote: note }).where(eq(products.id, subjectId));
  }
  return c.json({ success: true });
});

async function markDraft(db: ReturnType<typeof createDb>, subjectType: string, subjectId: string) {
  const note = "Gambar diubah. Hantar semula untuk harga.";
  if (subjectType === "motorcycle") {
    const bike = await db.select().from(motorcycles).where(eq(motorcycles.id, subjectId)).get();
    if (bike && bike.listingStatus !== "draf") await db.update(motorcycles).set({ listingStatus: "draf", listingNote: note }).where(eq(motorcycles.id, subjectId));
  } else if (subjectType === "product") {
    const part = await db.select().from(products).where(eq(products.id, subjectId)).get();
    if (part && part.listingStatus !== "draf") await db.update(products).set({ listingStatus: "draf", listingNote: note }).where(eq(products.id, subjectId));
  }
}

shotsRouter.delete("/shot/:shotId", async (c) => {
  const me = session(c);
  const db = createDb(c.env.DB);
  const shot = await db.select().from(itemShots).where(eq(itemShots.id, c.req.param("shotId"))).get();
  if (!shot) return c.json({ success: false, message: "Gambar tidak dijumpai" }, 404);
  if (!canUpload(me.role, shot.subjectType)) return c.json({ success: false, message: "Peranan ini tidak membuang gambar ini" }, 403);
  await db.delete(itemShots).where(eq(itemShots.id, shot.id));
  await markDraft(db, shot.subjectType, shot.subjectId);
  return c.json({ success: true });
});

shotsRouter.post("/motorcycles", async (c) => {
  const me = session(c);
  if (!isKerani(me.role)) return c.json({ success: false, message: "Hanya kerani menambah motor" }, 403);
  const body = await c.req.json();
  if (!body.brand || !body.model || !body.color || !body.engineNo || !body.chassisNo) {
    return c.json({ success: false, message: "Jenama, model, warna, nombor enjin, dan casis wajib" }, 400);
  }
  const now = new Date().toISOString();
  const id = `moto_${nanoid(8)}`;
  const db = createDb(c.env.DB);
  await db.insert(motorcycles).values({
    id,
    brand: String(body.brand),
    model: String(body.model),
    year: Number(body.year) || new Date().getFullYear(),
    color: String(body.color),
    engineNo: String(body.engineNo).trim(),
    chassisNo: String(body.chassisNo).trim(),
    condition: body.condition === "used" ? "used" : "new",
    currentMileage: Number(body.currentMileage) || 0,
    costPrice: Number(body.costPrice) || 0,
    sellingPrice: 0,
    plateNumber: body.plateNumber ? String(body.plateNumber).toUpperCase() : null,
    listingStatus: "draf",
    status: "available",
    createdAt: now,
  });
  return c.json({ success: true, id });
});

shotsRouter.patch("/motorcycles/:id", async (c) => {
  const me = session(c);
  if (!isKerani(me.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const db = createDb(c.env.DB);
  const bike = await db.select().from(motorcycles).where(eq(motorcycles.id, c.req.param("id"))).get();
  if (!bike) return c.json({ success: false, message: "Motor tidak dijumpai" }, 404);
  if (bike.status === "sold") return c.json({ success: false, message: "Motor yang sudah dijual tidak diubah di sini" }, 400);
  const body = await c.req.json();
  await db.update(motorcycles).set({
    brand: body.brand ? String(body.brand) : bike.brand,
    model: body.model ? String(body.model) : bike.model,
    year: body.year ? Number(body.year) : bike.year,
    color: body.color ? String(body.color) : bike.color,
    condition: body.condition === "used" || body.condition === "new" ? body.condition : bike.condition,
    plateNumber: body.plateNumber !== undefined ? String(body.plateNumber).toUpperCase() : bike.plateNumber,
    currentMileage: body.currentMileage !== undefined ? Number(body.currentMileage) : bike.currentMileage,
    costPrice: body.costPrice !== undefined ? Number(body.costPrice) : bike.costPrice,
    listingStatus: "draf",
    listingNote: "Butiran unit diubah. Set gambar perlu dihantar semula.",
  }).where(eq(motorcycles.id, bike.id));
  return c.json({ success: true });
});

shotsRouter.delete("/motorcycles/:id", async (c) => {
  const me = session(c);
  if (!isKerani(me.role) && me.role !== "owner") return c.json({ success: false, message: "Tidak dibenarkan" }, 403);
  const db = createDb(c.env.DB);
  const bike = await db.select().from(motorcycles).where(eq(motorcycles.id, c.req.param("id"))).get();
  if (!bike) return c.json({ success: false, message: "Motor tidak dijumpai" }, 404);
  if (bike.status === "sold" || bike.listingStatus === "dijual") return c.json({ success: false, message: "Motor yang sedang dijual tidak boleh dibuang" }, 400);
  await db.delete(itemShots).where(and(eq(itemShots.subjectType, "motorcycle"), eq(itemShots.subjectId, bike.id)));
  await db.delete(motorcycles).where(eq(motorcycles.id, bike.id));
  return c.json({ success: true });
});

shotsRouter.post("/products", async (c) => {
  const me = session(c);
  if (!isKerani(me.role)) return c.json({ success: false, message: "Hanya kerani menambah barang" }, 403);
  const body = await c.req.json();
  if (!body.name || !body.sku || !body.brand) return c.json({ success: false, message: "Nama, SKU, dan jenama wajib" }, 400);
  const now = new Date().toISOString();
  const db = createDb(c.env.DB);
  await db.insert(products).values({
    id: `prd_${nanoid(8)}`,
    sku: String(body.sku).trim(),
    name: String(body.name),
    category: String(body.category || "Umum"),
    brand: String(body.brand),
    costPrice: Number(body.costPrice) || 0,
    sellingPrice: 0,
    stockQty: Number(body.stockQty) || 0,
    rackLocation: String(body.rackLocation || "RAK-A1"),
    listingStatus: "draf",
    createdAt: now,
    updatedAt: now,
  });
  return c.json({ success: true });
});

shotsRouter.patch("/products/:id", async (c) => {
  const me = session(c);
  if (!isKerani(me.role)) return c.json({ success: false, message: "Hanya kerani" }, 403);
  const db = createDb(c.env.DB);
  const part = await db.select().from(products).where(eq(products.id, c.req.param("id"))).get();
  if (!part) return c.json({ success: false, message: "Barang tidak dijumpai" }, 404);
  const body = await c.req.json();
  await db.update(products).set({
    name: body.name ? String(body.name) : part.name,
    brand: body.brand ? String(body.brand) : part.brand,
    category: body.category ? String(body.category) : part.category,
    stockQty: body.stockQty !== undefined ? Number(body.stockQty) : part.stockQty,
    costPrice: body.costPrice !== undefined ? Number(body.costPrice) : part.costPrice,
    rackLocation: body.rackLocation ? String(body.rackLocation) : part.rackLocation,
    listingStatus: "draf",
    listingNote: "Butiran barang diubah. Set gambar perlu dihantar semula.",
    updatedAt: new Date().toISOString(),
  }).where(eq(products.id, part.id));
  return c.json({ success: true });
});

shotsRouter.delete("/products/:id", async (c) => {
  const me = session(c);
  if (!isKerani(me.role) && me.role !== "owner") return c.json({ success: false, message: "Tidak dibenarkan" }, 403);
  const db = createDb(c.env.DB);
  const part = await db.select().from(products).where(eq(products.id, c.req.param("id"))).get();
  if (!part) return c.json({ success: false, message: "Barang tidak dijumpai" }, 404);
  if (part.listingStatus === "dijual") return c.json({ success: false, message: "Barang yang sedang dijual tidak boleh dibuang" }, 400);
  await db.delete(itemShots).where(and(eq(itemShots.subjectType, "product"), eq(itemShots.subjectId, part.id)));
  await db.delete(products).where(eq(products.id, part.id));
  return c.json({ success: true });
});

shotsRouter.post("/documents", async (c) => {
  const me = session(c);
  if (!isKerani(me.role)) return c.json({ success: false, message: "Hanya kerani menambah resit atau dokumen" }, 403);
  const body = await c.req.json();
  if (!body.title) return c.json({ success: false, message: "Tajuk wajib" }, 400);
  const db = createDb(c.env.DB);
  await db.insert(captureDocs).values({
    id: `doc_${nanoid(8)}`,
    title: String(body.title),
    kind: body.kind === "lain" ? "lain" : "resit",
    note: body.note ? String(body.note) : null,
    status: "draf",
    createdBy: me.id,
    createdAt: new Date().toISOString(),
  });
  return c.json({ success: true });
});

shotsRouter.delete("/documents/:id", async (c) => {
  const me = session(c);
  if (!isKerani(me.role) && me.role !== "owner") return c.json({ success: false, message: "Tidak dibenarkan" }, 403);
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  await db.delete(itemShots).where(and(eq(itemShots.subjectType, "document"), eq(itemShots.subjectId, id)));
  await db.delete(captureDocs).where(eq(captureDocs.id, id));
  return c.json({ success: true });
});

shotsRouter.post("/video", async (c) => {
  const user = session(c);
  const body = await c.req.json();
  const subjectType = String(body.subjectType || "");
  if (!canUpload(user.role, subjectType) || subjectType === "service" || subjectType === "document") {
    return c.json({ success: false, message: "Hanya kerani boleh letak video jualan" }, 403);
  }
  const raw = String(body.videoUrl || "").trim();
  if (raw && !youtubeId(raw)) return c.json({ success: false, message: "Video hanya pautan YouTube" }, 400);
  const db = createDb(c.env.DB);
  const subject = await loadSubject(db, subjectType, String(body.subjectId || ""));
  if (!subject || (subject.kind !== "motorcycle" && subject.kind !== "product")) {
    return c.json({ success: false, message: "Rekod tidak dijumpai" }, 404);
  }
  if (subject.kind === "motorcycle") await db.update(motorcycles).set({ videoUrl: raw || null }).where(eq(motorcycles.id, subject.row.id));
  else await db.update(products).set({ videoUrl: raw || null }).where(eq(products.id, subject.row.id));
  return c.json({ success: true });
});

shotsRouter.post("/submit", async (c) => {
  const me = session(c);
  const body = await c.req.json();
  const subjectType = String(body.subjectType || "");
  const subjectId = String(body.subjectId || "");
  if (!canUpload(me.role, subjectType)) return c.json({ success: false, message: "Peranan ini tidak menghantar set ini" }, 403);
  const db = createDb(c.env.DB);
  const subject = await loadSubject(db, subjectType, subjectId);
  if (!subject) return c.json({ success: false, message: "Rekod tidak dijumpai" }, 404);
  const shots = await db.select().from(itemShots).where(and(eq(itemShots.subjectType, subjectType as "motorcycle" | "product"), eq(itemShots.subjectId, subjectId))).all();
  const need = requiredSlots(subjectType, subject.kind === "motorcycle" ? subject.row.condition : null);
  if (!filled(shots, need)) return c.json({ success: false, message: "Setiap sudut wajib masih kosong" }, 400);
  if (subject.kind === "motorcycle") await db.update(motorcycles).set({ listingStatus: "menunggu_harga", listingNote: null }).where(eq(motorcycles.id, subjectId));
  else if (subject.kind === "product") await db.update(products).set({ listingStatus: "menunggu_harga", listingNote: null }).where(eq(products.id, subjectId));
  else if (subject.kind === "document") await db.update(captureDocs).set({ status: "disimpan" }).where(eq(captureDocs.id, subjectId));
  return c.json({ success: true });
});

shotsRouter.post("/confirm", async (c) => {
  return c.json({ success: false, message: "Foreman tidak menyemak gambar jualan. Dia hanya ambil gambar servis." }, 403);
});

shotsRouter.post("/reject", async (c) => {
  const me = session(c);
  if (me.role !== "foreman") return c.json({ success: false, message: "Hanya foreman" }, 403);
  const body = await c.req.json();
  const reason = String(body.reason || "").trim();
  if (reason.length < 3) return c.json({ success: false, message: "Nyatakan sebab tolak" }, 400);
  const subjectType = String(body.subjectType || "");
  const subjectId = String(body.subjectId || "");
  const db = createDb(c.env.DB);
  const subject = await loadSubject(db, subjectType, subjectId);
  if (!subject) return c.json({ success: false, message: "Rekod tidak dijumpai" }, 404);
  if (subject.kind === "motorcycle") await db.update(motorcycles).set({ listingStatus: "draf", listingNote: reason }).where(eq(motorcycles.id, subjectId));
  else await db.update(products).set({ listingStatus: "draf", listingNote: reason }).where(eq(products.id, subjectId));
  return c.json({ success: true });
});
