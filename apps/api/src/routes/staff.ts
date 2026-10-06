import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { users, staffProfiles, mechanicCommissions } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const staffRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai semua staf berserta profil prestasi mekanik
staffRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      isActive: users.isActive,
      profileId: staffProfiles.id,
      specialty: staffProfiles.specialty,
      basicSalary: staffProfiles.basicSalary,
      commissionRate: staffProfiles.commissionRate,
      activeBay: staffProfiles.activeBay,
      rating: staffProfiles.rating,
      totalJobsDone: staffProfiles.totalJobsDone,
    })
    .from(users)
    .leftJoin(staffProfiles, eq(users.id, staffProfiles.userId))
    .all();

  return c.json({ success: true, staff: list });
});

// Kemas kini atau wujudkan profil mekanik
staffRouter.post("/profile", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();

  const existing = await db
    .select()
    .from(staffProfiles)
    .where(eq(staffProfiles.userId, body.userId))
    .get();

  if (existing) {
    await db
      .update(staffProfiles)
      .set({
        specialty: body.specialty || existing.specialty,
        basicSalary: Number(body.basicSalary ?? existing.basicSalary),
        commissionRate: Number(body.commissionRate ?? existing.commissionRate),
        activeBay: body.activeBay !== undefined ? Number(body.activeBay) : existing.activeBay,
      })
      .where(eq(staffProfiles.id, existing.id))
      .run();

    return c.json({ success: true, message: "Profil staf berjaya dikemas kini." });
  } else {
    const id = nanoid();
    await db
      .insert(staffProfiles)
      .values({
        id,
        userId: body.userId,
        specialty: body.specialty || "Servis Umum",
        basicSalary: Number(body.basicSalary || 1800),
        commissionRate: Number(body.commissionRate || 15),
        activeBay: body.activeBay ? Number(body.activeBay) : null,
      })
      .run();

    return c.json({ success: true, message: "Profil staf berjaya didaftarkan." });
  }
});

// Senarai rekod komisen mekanik
staffRouter.get("/commissions", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db
    .select({
      id: mechanicCommissions.id,
      mechanicId: mechanicCommissions.mechanicId,
      workOrderId: mechanicCommissions.workOrderId,
      workOrderNumber: mechanicCommissions.workOrderNumber,
      plateNumber: mechanicCommissions.plateNumber,
      laborTotal: mechanicCommissions.laborTotal,
      commissionPercent: mechanicCommissions.commissionPercent,
      commissionAmount: mechanicCommissions.commissionAmount,
      status: mechanicCommissions.status,
      createdAt: mechanicCommissions.createdAt,
      paidAt: mechanicCommissions.paidAt,
      mechanicName: users.name,
    })
    .from(mechanicCommissions)
    .leftJoin(users, eq(mechanicCommissions.mechanicId, users.id))
    .orderBy(desc(mechanicCommissions.createdAt))
    .all();

  const formatted = list.map((item) => ({
    ...item,
    mechanicName: item.mechanicName || "Mekanik Bertugas",
  }));

  return c.json({ success: true, commissions: formatted });
});

// Bayar komisen mekanik
staffRouter.post("/commissions/:id/pay", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");

  await db
    .update(mechanicCommissions)
    .set({ status: "paid", paidAt: new Date().toISOString() })
    .where(eq(mechanicCommissions.id, id))
    .run();

  return c.json({ success: true, message: "Bayaran komisen telah disahkan." });
});

