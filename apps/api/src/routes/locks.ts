import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { bikeLocks, motorcycles } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const locksRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai kunci unit motor
locksRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db
    .select({
      id: bikeLocks.id,
      bookingNo: bikeLocks.bookingNo,
      motorcycleId: bikeLocks.motorcycleId,
      customerName: bikeLocks.customerName,
      customerPhone: bikeLocks.customerPhone,
      customerIc: bikeLocks.customerIc,
      depositAmount: bikeLocks.depositAmount,
      loanProvider: bikeLocks.loanProvider,
      loanStatus: bikeLocks.loanStatus,
      isContractSigned: bikeLocks.isContractSigned,
      status: bikeLocks.status,
      lockedAt: bikeLocks.lockedAt,
      brand: motorcycles.brand,
      model: motorcycles.model,
      color: motorcycles.color,
      chassisNo: motorcycles.chassisNo,
      sellingPrice: motorcycles.sellingPrice,
    })
    .from(bikeLocks)
    .innerJoin(motorcycles, eq(bikeLocks.motorcycleId, motorcycles.id))
    .orderBy(desc(bikeLocks.lockedAt))
    .all();

  return c.json({ success: true, locks: list });
});

// GOLDEN LOOP 3: Kunci Unit Motor Showroom (Deposit Lock)
locksRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();

  const id = nanoid();
  const bookingNo = `LOCK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // 1. Simpan rekod kunci dalam D1
  const lockData = {
    id,
    bookingNo,
    motorcycleId: body.motorcycleId,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerIc: body.customerIc || "",
    depositAmount: Number(body.depositAmount || 100),
    loanProvider: body.loanProvider || "Tunai / Tiada",
    loanStatus: (body.loanProvider === "Tunai / Tiada" ? "approved" : "pending") as any,
    isContractSigned: Boolean(body.isContractSigned),
    status: "locked" as const,
    lockedAt: new Date().toISOString(),
    notes: body.notes || "",
  };

  await db.insert(bikeLocks).values(lockData).run();

  // 2. Kunci status unit motor showroom supaya tidak boleh dijual kepada orang lain!
  await db.update(motorcycles)
    .set({ status: "booked" })
    .where(eq(motorcycles.id, body.motorcycleId))
    .run();

  return c.json({
    success: true,
    message: `Unit berjaya dikunci dengan no tempahan ${bookingNo}! Status motor telah ditukar kepada 'booked'.`,
    lock: lockData,
  });
});

// Batal / Lepaskan Kunci Unit (Kembalikan stok ke showroom)
locksRouter.post("/:id/release", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  const lock = await db.select().from(bikeLocks).where(eq(bikeLocks.id, id)).get();
  if (!lock) return c.json({ success: false, message: "Rekod kunci tidak dijumpai" }, 404);

  // 1. Kemas kini status kunci
  await db.update(bikeLocks).set({ status: "cancelled" }).where(eq(bikeLocks.id, id)).run();

  // 2. Kembalikan unit motor ke status 'available'
  await db.update(motorcycles).set({ status: "available" }).where(eq(motorcycles.id, lock.motorcycleId)).run();

  return c.json({ success: true, message: `Kunci ${lock.bookingNo} dilepaskan. Motor sedia dijual semula.` });
});

// Luluskan Status Pinjaman (AEON / Chailease)
locksRouter.post("/:id/approve-loan", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  await db.update(bikeLocks).set({ loanStatus: "approved" }).where(eq(bikeLocks.id, id)).run();
  return c.json({ success: true, message: "Status pinjaman telah dikemaskini kepada 'Lulus'." });
});

