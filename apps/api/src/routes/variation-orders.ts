import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { variationOrders, workOrders, workOrderItems, vehicles } from "@ffmotor/db";
import { Bindings, Variables } from "../types";

export const variationOrdersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai semua VO (Admin / Foreman / Pit)
variationOrdersRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const workOrderId = c.req.query("workOrderId");

  try {
    if (workOrderId) {
      const records = await db
        .select()
        .from(variationOrders)
        .where(eq(variationOrders.workOrderId, workOrderId))
        .orderBy(desc(variationOrders.createdAt));
      return c.json({ success: true, variationOrders: records });
    }

    const all = await db
      .select()
      .from(variationOrders)
      .orderBy(desc(variationOrders.createdAt));
    return c.json({ success: true, variationOrders: all });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Semakan awam melalui token magic (untuk dibuka pelanggan di telefon melalui WhatsApp)
variationOrdersRouter.get("/token/:token", async (c) => {
  const token = c.req.param("token");
  const db = createDb(c.env.DB);

  try {
    const voList = await db
      .select()
      .from(variationOrders)
      .where(eq(variationOrders.token, token))
      .limit(1);

    if (voList.length === 0) {
      return c.json({ success: false, message: "Rekod permohonan alat ganti tidak dijumpai" }, 404);
    }

    const vo = voList[0];

    // Ambil maklumat Work Order yang bersangkutan bersama butiran kenderaan
    const woList = await db
      .select({
        id: workOrders.id,
        woNumber: workOrders.woNumber,
        vehicleId: workOrders.vehicleId,
        status: workOrders.status,
        mileageIn: workOrders.mileageIn,
        customerComplaint: workOrders.customerComplaint,
        approvalToken: workOrders.approvalToken,
        grandTotal: workOrders.grandTotal,
        paymentStatus: workOrders.paymentStatus,
        createdAt: workOrders.createdAt,
        plateNumber: vehicles.plateNumber,
        brand: vehicles.brand,
        model: vehicles.model,
        ownerName: vehicles.ownerName,
        ownerPhone: vehicles.ownerPhone,
      })
      .from(workOrders)
      .leftJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
      .where(eq(workOrders.id, vo.workOrderId))
      .limit(1);

    return c.json({
      success: true,
      variationOrder: vo,
      workOrder: woList[0] || null,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Mekanik/SA cipta permohonan VO dari Pit Master Board
const createVoHandler = async (c: any) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();

  const id = `vo_${Date.now()}`;
  const voNumber = `VO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const token = `vo_tok_${Math.random().toString(36).substring(2, 12)}`;

  const estimated = Number(body.estimatedAmount) || 0;
  const partCost = Number(body.partCost) || estimated || 0;
  const laborCost = Number(body.laborCost) || 0;
  const totalAmount = (Number(body.totalAmount) || 0) || (partCost + laborCost) || estimated;

  try {
    await db.insert(variationOrders).values({
      id,
      workOrderId: body.workOrderId,
      voNumber,
      title: body.title || `Penukaran ${body.partName || "Komponen Tambahan"}`,
      reason: body.reason || "Kerosakan fizikal dikesan semasa lif dinaikkan",
      partCode: body.partCode || "OEM-CUSTOM",
      partName: body.partName || "Alat Ganti Tambahan",
      partCost,
      laborCost,
      totalAmount,
      photoUrl: body.photoUrl || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80",
      token,
      status: "pending",
      requestedBy: body.requestedBy || "Ketua Mekanik Pit",
      customerPhone: body.customerPhone || "0123456789",
      createdAt: new Date().toISOString(),
    });

    return c.json({
      success: true,
      message: "Permohonan VO berjaya didaftarkan",
      id,
      voNumber,
      token,
      magicUrl: `/vo/${token}`,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
};

variationOrdersRouter.post("/create", createVoHandler);
variationOrdersRouter.post("/", createVoHandler);

// Pelanggan meluluskan VO (1-Klik di telefon)
variationOrdersRouter.post("/:token/approve", async (c) => {
  const token = c.req.param("token");
  const body = await c.req.json().catch(() => ({}));
  const db = createDb(c.env.DB);

  try {
    const voList = await db
      .select()
      .from(variationOrders)
      .where(eq(variationOrders.token, token))
      .limit(1);

    if (voList.length === 0) {
      return c.json({ success: false, message: "Rekod VO tidak dijumpai" }, 404);
    }

    const vo = voList[0];
    const now = new Date().toISOString();

    // 1. Kemas kini status VO kepada 'approved'
    await db
      .update(variationOrders)
      .set({
        status: "approved",
        approvedAt: now,
        customerNotes: body.notes || "Diluluskan oleh pemilik kenderaan",
        updatedAt: now,
      })
      .where(eq(variationOrders.id, vo.id));

    // 2. Tambah item baharu ke dalam work_order_items
    const itemId = `woi_vo_${Date.now()}`;
    await db.insert(workOrderItems).values({
      id: itemId,
      workOrderId: vo.workOrderId,
      itemType: "part",
      description: `[VO] ${vo.partName} (${vo.partCode})`,
      quantity: 1,
      unitPrice: vo.totalAmount,
      totalPrice: vo.totalAmount,
      isRequiresApproval: true,
      isApproved: true,
      createdAt: now,
    });

    // 3. Kemas kini grandTotal dalam work_orders
    const woList = await db
      .select()
      .from(workOrders)
      .where(eq(workOrders.id, vo.workOrderId))
      .limit(1);

    if (woList.length > 0) {
      const wo = woList[0];
      const newParts = (wo.totalPartsAmount || 0) + vo.partCost;
      const newLabor = (wo.totalLaborAmount || 0) + vo.laborCost;
      const newTotal = (wo.grandTotal || 0) + vo.totalAmount;
      await db
        .update(workOrders)
        .set({
          totalPartsAmount: newParts,
          totalLaborAmount: newLabor,
          grandTotal: newTotal,
        })
        .where(eq(workOrders.id, wo.id));
    }

    return c.json({
      success: true,
      message: "Variation Order diluluskan. Kos kerja dikemas kini serta-merta.",
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Pelanggan menolak VO
variationOrdersRouter.post("/:token/reject", async (c) => {
  const token = c.req.param("token");
  const body = await c.req.json().catch(() => ({}));
  const db = createDb(c.env.DB);

  try {
    const now = new Date().toISOString();
    await db
      .update(variationOrders)
      .set({
        status: "rejected",
        customerNotes: body.reason || "Pelanggan memilih untuk tidak menukar komponen sekarang",
        updatedAt: now,
      })
      .where(eq(variationOrders.token, token));

    return c.json({
      success: true,
      message: "Makluman penolakan diterima. Pasukan pit akan teruskan kerja asal.",
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
