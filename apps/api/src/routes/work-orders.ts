import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "@ffmotor/db";
import { Bindings, Variables } from "../types";
import { WorkshopService } from "../services/workshop.service";
import { requireAuth } from "../middlewares/guard";

export const workOrdersRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Skema fleksibel: menyokong kedua-dua Express Intake (no plat + pemilik) dan pendaftaran standard (vehicleId)
const createWorkOrderSchema = z.object({
  vehicleId: z.string().optional(),
  plateNumber: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  mileageIn: z.coerce.number().optional(),
  customerComplaint: z.string().min(1, "Aduan kerosakan diperlukan"),
  mechanicId: z.string().nullable().optional(),
  assignedBay: z.coerce.number().optional(),
  approvalToken: z.string().optional(),
  checklist: z.record(z.string(), z.boolean()).optional(),
  safetyFlags: z.string().optional(),
  keyTag: z.string().optional(),
});

// Skema Tambah Item (Alat Ganti / Upah Buruh)
const addWorkOrderItemSchema = z.object({
  itemType: z.enum(["part", "labor"]),
  productId: z.string().nullable().optional(),
  description: z.string().min(1, "Penerangan item diperlukan"),
  quantity: z.coerce.number().min(1).default(1),
  unitPrice: z.coerce.number().min(0).default(0),
  isRequiresApproval: z.boolean().optional(),
  installedSerialId: z.string().nullable().optional(),
});

// Skema Bayaran POS Kaunter
const payWorkOrderSchema = z.object({
  paymentMethod: z.string().optional(),
  discountAmount: z.coerce.number().optional(),
});

// Status tanpa video proof: QC fizikal oleh Foreman terus ke ready
const updateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "inspecting",
    "in_progress",
    "waiting_parts",
    "ready",
    "completed",
    "cancelled",
  ]),
  mechanicNotes: z.string().optional(),
});

// 1. Dapatkan senarai work order
workOrdersRouter.get("/", requireAuth(), async (c) => {
  const db = createDb(c.env.DB);
  const workshop = new WorkshopService(db);
  const status = c.req.query("status");
  const list = await workshop.listWorkOrders(status);
  return c.json({ success: true, workOrders: list });
});

// 2. Maklumat terperinci satu work order + items
workOrdersRouter.get("/:id", requireAuth(), async (c) => {
  const db = createDb(c.env.DB);
  const workshop = new WorkshopService(db);
  const id = c.req.param("id")!;
  const result = await workshop.getWorkOrderDetail(id);
  return c.json({ success: true, ...result });
});

// 3. Dapatkan senarai pecahan item untuk satu work order
workOrdersRouter.get("/:id/items", requireAuth(), async (c) => {
  const db = createDb(c.env.DB);
  const workshop = new WorkshopService(db);
  const id = c.req.param("id")!;
  const items = await workshop.getWorkOrderItems(id);
  return c.json({ success: true, items });
});

// 4. Buka Work Order Baharu (Menyokong Express Intake & Standard)
workOrdersRouter.post("/", requireAuth(), zValidator("json", createWorkOrderSchema), async (c) => {
  const db = createDb(c.env.DB);
  const workshop = new WorkshopService(db);
  const body = c.req.valid("json");

  // Jika dihantar dari Kaunter Express Intake (dengan plateNumber)
  if (body.plateNumber) {
    const result = await workshop.createExpressWorkOrder({
      plateNumber: body.plateNumber,
      ownerName: body.ownerName || "Pelanggan Walk-in",
      ownerPhone: body.ownerPhone || "0123456789",
      brand: body.brand,
      model: body.model,
      mileageIn: body.mileageIn,
      customerComplaint: body.customerComplaint,
      mechanicId: body.mechanicId,
      assignedBay: body.assignedBay,
      approvalToken: body.approvalToken,
      checklist: body.checklist as Record<string, boolean> | undefined,
    });
    return c.json({ success: true, workOrder: result.workOrder, vehicle: result.vehicle }, 201);
  }

  // Jika dihantar dengan vehicleId standard
  if (!body.vehicleId) {
    return c.json({ success: false, message: "ID Kenderaan atau No. Plat diperlukan" }, 400);
  }

  const newWO = await workshop.createWorkOrder({
    vehicleId: body.vehicleId,
    mechanicId: body.mechanicId,
    mileageIn: body.mileageIn,
    customerComplaint: body.customerComplaint,
    approvalToken: body.approvalToken,
  });

  return c.json({ success: true, workOrder: newWO }, 201);
});

// 5. Tambah Item (Alat Ganti / Upah Buruh) & Tolak Stok Rak Automatik
workOrdersRouter.post("/:id/items", requireAuth(), zValidator("json", addWorkOrderItemSchema), async (c) => {
  const db = createDb(c.env.DB);
  const workshop = new WorkshopService(db);
  const id = c.req.param("id")!;
  const body = c.req.valid("json");
  const result = await workshop.addWorkOrderItem(id, body);
  return c.json({ success: true, ...result }, 201);
});

// 6. Padam Item dari Work Order & Kembalikan Baki Stok
workOrdersRouter.delete("/:id/items/:itemId", requireAuth(), async (c) => {
  const db = createDb(c.env.DB);
  const workshop = new WorkshopService(db);
  const id = c.req.param("id")!;
  const itemId = c.req.param("itemId")!;
  const result = await workshop.deleteWorkOrderItem(id, itemId);
  return c.json({ success: true, ...result });
});

// 7. Bayaran POS Kaunter & Tutup Status ke Selesai
workOrdersRouter.post("/:id/pay", requireAuth(), zValidator("json", payWorkOrderSchema), async (c) => {
  const db = createDb(c.env.DB);
  const workshop = new WorkshopService(db);
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const result = await workshop.payWorkOrder(id, body);
  return c.json({ success: true, ...result });
});

// 8. Kemaskini Status Work Order
workOrdersRouter.patch("/:id/status", requireAuth(), zValidator("json", updateStatusSchema), async (c) => {
  const db = createDb(c.env.DB);
  const workshop = new WorkshopService(db);
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const result = await workshop.updateStatus(id, body.status, body.mechanicNotes);
  return c.json({ success: true, ...result });
});
