import { eq, desc } from "drizzle-orm";
import { workOrders, workOrderItems, vehicles, products, mechanicCommissions } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { NotFoundError, ValidationError } from "../middlewares/error";

export class WorkshopService {
  constructor(private db: any) {}

  async listWorkOrders(status?: string) {
    // Memasukkan semua medan lejar & token agar senarai kad kerja, kewangan dan penjejakan berfungsi sepenuhnya
    const query = this.db
      .select({
        id: workOrders.id,
        woNumber: workOrders.woNumber,
        status: workOrders.status,
        mileageIn: workOrders.mileageIn,
        customerComplaint: workOrders.customerComplaint,
        mechanicNotes: workOrders.mechanicNotes,
        mechanicId: workOrders.mechanicId,
        totalPartsAmount: workOrders.totalPartsAmount,
        totalLaborAmount: workOrders.totalLaborAmount,
        discountAmount: workOrders.discountAmount,
        grandTotal: workOrders.grandTotal,
        paymentStatus: workOrders.paymentStatus,
        paymentMethod: workOrders.paymentMethod,
        approvalToken: workOrders.approvalToken,
        createdAt: workOrders.createdAt,
        completedAt: workOrders.completedAt,
        vehicleId: vehicles.id,
        plateNumber: vehicles.plateNumber,
        brand: vehicles.brand,
        model: vehicles.model,
        ownerName: vehicles.ownerName,
        ownerPhone: vehicles.ownerPhone,
      })
      .from(workOrders)
      .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id));

    const list = await query.orderBy(desc(workOrders.createdAt)).all();

    const mapped = list.map((item: any) => {
      let assignedBay: number | undefined;
      if (item.mechanicNotes && /Bay #(\d+)/.test(item.mechanicNotes)) {
        const match = item.mechanicNotes.match(/Bay #(\d+)/);
        if (match) assignedBay = parseInt(match[1], 10);
      }
      return {
        ...item,
        assignedBay,
      };
    });

    if (status && status !== "all") {
      return mapped.filter((item: any) => item.status === status);
    }
    return mapped;
  }

  async getWorkOrderDetail(id: string) {
    const woList = await this.db
      .select({
        id: workOrders.id,
        woNumber: workOrders.woNumber,
        status: workOrders.status,
        mileageIn: workOrders.mileageIn,
        customerComplaint: workOrders.customerComplaint,
        mechanicNotes: workOrders.mechanicNotes,
        mechanicId: workOrders.mechanicId,
        totalPartsAmount: workOrders.totalPartsAmount,
        totalLaborAmount: workOrders.totalLaborAmount,
        discountAmount: workOrders.discountAmount,
        grandTotal: workOrders.grandTotal,
        paymentStatus: workOrders.paymentStatus,
        paymentMethod: workOrders.paymentMethod,
        approvalToken: workOrders.approvalToken,
        createdAt: workOrders.createdAt,
        completedAt: workOrders.completedAt,
        vehicleId: vehicles.id,
        plateNumber: vehicles.plateNumber,
        brand: vehicles.brand,
        model: vehicles.model,
        ownerName: vehicles.ownerName,
        ownerPhone: vehicles.ownerPhone,
      })
      .from(workOrders)
      .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
      .where(eq(workOrders.id, id))
      .all();

    const wo = woList[0];
    if (!wo) {
      throw new NotFoundError("Pesanan kerja (Work order) tidak dijumpai.");
    }

    const items = await this.db
      .select()
      .from(workOrderItems)
      .where(eq(workOrderItems.workOrderId, id))
      .all();

    let assignedBay: number | undefined;
    if (wo.mechanicNotes && /Bay #(\d+)/.test(wo.mechanicNotes)) {
      const match = wo.mechanicNotes.match(/Bay #(\d+)/);
      if (match) assignedBay = parseInt(match[1], 10);
    }

    return { workOrder: { ...wo, assignedBay }, items };
  }

  async getWorkOrderItems(workOrderId: string) {
    return this.db
      .select()
      .from(workOrderItems)
      .where(eq(workOrderItems.workOrderId, workOrderId))
      .all();
  }

  async createWorkOrder(data: {
    vehicleId: string;
    mechanicId?: string | null;
    mileageIn?: number;
    customerComplaint: string;
    approvalToken?: string;
  }) {
    if (!data.vehicleId || !data.customerComplaint) {
      throw new ValidationError("Kenderaan dan aduan kerosakan diperlukan.");
    }

    const allWO = await this.db.select().from(workOrders).all();
    const runningIndex = allWO.length + 1;
    const woNumber = `WO-${new Date().getFullYear()}-${String(runningIndex).padStart(4, "0")}`;
    const now = new Date().toISOString();

    const newWO = {
      id: `wo_${nanoid(8)}`,
      woNumber,
      vehicleId: data.vehicleId,
      mechanicId: data.mechanicId || "usr_mech1",
      status: "pending" as const,
      mileageIn: data.mileageIn || 0,
      customerComplaint: data.customerComplaint,
      mechanicNotes: null,
      videoProofKey: null,
      videoDescription: null,
      approvalToken: data.approvalToken || `tok_${nanoid(12)}`,
      isApprovedByCustomer: null,
      customerApprovedAt: null,
      totalPartsAmount: 0,
      totalLaborAmount: 0,
      discountAmount: 0,
      grandTotal: 0,
      paymentStatus: "unpaid" as const,
      paymentMethod: null,
      createdAt: now,
      completedAt: null,
    };

    await this.db.insert(workOrders).values(newWO).run();

    if (data.mileageIn) {
      await this.db
        .update(vehicles)
        .set({ currentMileage: data.mileageIn, updatedAt: now })
        .where(eq(vehicles.id, data.vehicleId))
        .run();
    }

    return newWO;
  }

  async createExpressWorkOrder(data: {
    plateNumber: string;
    ownerName: string;
    ownerPhone: string;
    brand?: string;
    model?: string;
    mileageIn?: number;
    customerComplaint: string;
    mechanicId?: string | null;
    assignedBay?: number;
    approvalToken?: string;
    checklist?: Record<string, boolean>;
  }) {
    if (!data.plateNumber || !data.customerComplaint) {
      throw new ValidationError("No. plat dan aduan kerosakan diperlukan.");
    }

    const cleanPlate = data.plateNumber.toUpperCase().trim();
    const normalizedPlate = cleanPlate.replace(/\s+/g, "");
    const now = new Date().toISOString();

    // 1. Cari kenderaan sedia ada atau daftar baharu
    let vehicleList = await this.db
      .select()
      .from(vehicles)
      .where(eq(vehicles.plateNormalized, normalizedPlate))
      .all();

    let vehicle = vehicleList[0];

    if (!vehicle) {
      const newVehId = `veh_${nanoid(8)}`;
      vehicle = {
        id: newVehId,
        plateNumber: cleanPlate,
        plateNormalized: normalizedPlate,
        brand: data.brand || "Yamaha",
        model: data.model || "Motosikal",
        year: new Date().getFullYear(),
        engineNo: null,
        chassisNo: null,
        ownerName: data.ownerName || "Pelanggan Walk-in",
        ownerPhone: data.ownerPhone || "0123456789",
        currentMileage: data.mileageIn || 0,
        lastServiceMileage: data.mileageIn || 0,
        lastServiceDate: now.split("T")[0],
        dailyKmAvg: 35.0,
        healthScore: 100,
        passportToken: `pass_${nanoid(10)}`,
        createdAt: now,
        updatedAt: now,
      };
      await this.db.insert(vehicles).values(vehicle).run();
    } else {
      // Kemas kini nama/telefon/mileage jika ada maklumat baharu
      await this.db
        .update(vehicles)
        .set({
          ownerName: data.ownerName || vehicle.ownerName,
          ownerPhone: data.ownerPhone || vehicle.ownerPhone,
          currentMileage: data.mileageIn ? Math.max(vehicle.currentMileage || 0, data.mileageIn) : vehicle.currentMileage,
          updatedAt: now,
        })
        .where(eq(vehicles.id, vehicle.id))
        .run();
    }

    // 2. Cipta Work Order baharu
    const allWO = await this.db.select().from(workOrders).all();
    const runningIndex = allWO.length + 1;
    const woNumber = `WO-${new Date().getFullYear()}-${String(runningIndex).padStart(4, "0")}`;
    const token = data.approvalToken || `tok_${normalizedPlate.toLowerCase()}_${Date.now().toString().slice(-4)}`;

    const newWO = {
      id: `wo_${nanoid(8)}`,
      woNumber,
      vehicleId: vehicle.id,
      mechanicId: data.mechanicId || "usr_mech1",
      status: "pending" as const,
      mileageIn: data.mileageIn || vehicle.currentMileage || 0,
      customerComplaint: data.customerComplaint,
      mechanicNotes: data.assignedBay ? `Lif Pit: Bay #${data.assignedBay}` : null,
      videoProofKey: null,
      videoDescription: null,
      approvalToken: token,
      isApprovedByCustomer: null,
      customerApprovedAt: null,
      totalPartsAmount: 0,
      totalLaborAmount: 0,
      discountAmount: 0,
      grandTotal: 0,
      paymentStatus: "unpaid" as const,
      paymentMethod: null,
      createdAt: now,
      completedAt: null,
    };

    await this.db.insert(workOrders).values(newWO).run();

    return {
      workOrder: newWO,
      vehicle,
    };
  }

  async addWorkOrderItem(workOrderId: string, data: {
    itemType: "part" | "labor";
    productId?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    isRequiresApproval?: boolean;
    installedSerialId?: string | null;
  }) {
    const woList = await this.db.select().from(workOrders).where(eq(workOrders.id, workOrderId)).all();
    const wo = woList[0];
    if (!wo) {
      throw new NotFoundError("Pesanan kerja (Work order) tidak dijumpai.");
    }

    const qty = Math.max(1, Number(data.quantity || 1));
    const price = Math.max(0, Number(data.unitPrice || 0));
    const totalPrice = Math.round(qty * price * 100) / 100;
    const now = new Date().toISOString();
    const itemId = `woi_${nanoid(8)}`;

    // 1. Simpan rekod item
    const newItem = {
      id: itemId,
      workOrderId,
      itemType: data.itemType,
      productId: data.productId || null,
      description: data.description,
      quantity: qty,
      unitPrice: price,
      totalPrice,
      isRequiresApproval: Boolean(data.isRequiresApproval),
      isApproved: true,
      installedSerialId: data.installedSerialId || null,
      createdAt: now,
    };

    await this.db.insert(workOrderItems).values(newItem).run();

    // 2. Jika alat ganti (part) dari stor, tolak baki stok rak
    if (data.itemType === "part" && data.productId) {
      const prodList = await this.db.select().from(products).where(eq(products.id, data.productId)).all();
      const prod = prodList[0];
      if (prod) {
        const newStock = Math.max(0, prod.stockQty - qty);
        await this.db
          .update(products)
          .set({ stockQty: newStock, updatedAt: now })
          .where(eq(products.id, data.productId))
          .run();
      }
    }

    // 3. Kira semula semua item dalam work order ini
    const allItems = await this.db
      .select()
      .from(workOrderItems)
      .where(eq(workOrderItems.workOrderId, workOrderId))
      .all();

    const totalParts = allItems
      .filter((i: any) => i.itemType === "part")
      .reduce((sum: number, curr: any) => sum + (curr.totalPrice || 0), 0);

    const totalLabor = allItems
      .filter((i: any) => i.itemType === "labor")
      .reduce((sum: number, curr: any) => sum + (curr.totalPrice || 0), 0);

    const discount = wo.discountAmount || 0;
    const grandTotal = Math.max(0, totalParts + totalLabor - discount);

    await this.db
      .update(workOrders)
      .set({
        totalPartsAmount: totalParts,
        totalLaborAmount: totalLabor,
        grandTotal,
      })
      .where(eq(workOrders.id, workOrderId))
      .run();

    return {
      item: newItem,
      totalPartsAmount: totalParts,
      totalLaborAmount: totalLabor,
      grandTotal,
    };
  }

  async deleteWorkOrderItem(workOrderId: string, itemId: string) {
    const woList = await this.db.select().from(workOrders).where(eq(workOrders.id, workOrderId)).all();
    const wo = woList[0];
    if (!wo) {
      throw new NotFoundError("Pesanan kerja (Work order) tidak dijumpai.");
    }

    const itemList = await this.db
      .select()
      .from(workOrderItems)
      .where(eq(workOrderItems.id, itemId))
      .all();

    const item = itemList[0];
    if (!item) {
      throw new NotFoundError("Item tidak dijumpai.");
    }

    // 1. Jika alat ganti dari rak, kembalikan baki stok
    if (item.itemType === "part" && item.productId) {
      const prodList = await this.db.select().from(products).where(eq(products.id, item.productId)).all();
      const prod = prodList[0];
      if (prod) {
        await this.db
          .update(products)
          .set({ stockQty: prod.stockQty + item.quantity, updatedAt: new Date().toISOString() })
          .where(eq(products.id, item.productId))
          .run();
      }
    }

    // 2. Padam rekod item
    await this.db.delete(workOrderItems).where(eq(workOrderItems.id, itemId)).run();

    // 3. Kira semula jumlah lejar
    const remainingItems = await this.db
      .select()
      .from(workOrderItems)
      .where(eq(workOrderItems.workOrderId, workOrderId))
      .all();

    const totalParts = remainingItems
      .filter((i: any) => i.itemType === "part")
      .reduce((sum: number, curr: any) => sum + (curr.totalPrice || 0), 0);

    const totalLabor = remainingItems
      .filter((i: any) => i.itemType === "labor")
      .reduce((sum: number, curr: any) => sum + (curr.totalPrice || 0), 0);

    const discount = wo.discountAmount || 0;
    const grandTotal = Math.max(0, totalParts + totalLabor - discount);

    await this.db
      .update(workOrders)
      .set({
        totalPartsAmount: totalParts,
        totalLaborAmount: totalLabor,
        grandTotal,
      })
      .where(eq(workOrders.id, workOrderId))
      .run();

    return {
      message: "Item berjaya dipadam dari bil.",
      totalPartsAmount: totalParts,
      totalLaborAmount: totalLabor,
      grandTotal,
    };
  }

  async payWorkOrder(workOrderId: string, data: { paymentMethod?: string; discountAmount?: number }) {
    const woList = await this.db
      .select({
        id: workOrders.id,
        woNumber: workOrders.woNumber,
        mechanicId: workOrders.mechanicId,
        totalPartsAmount: workOrders.totalPartsAmount,
        totalLaborAmount: workOrders.totalLaborAmount,
        discountAmount: workOrders.discountAmount,
        grandTotal: workOrders.grandTotal,
        paymentStatus: workOrders.paymentStatus,
        plateNumber: vehicles.plateNumber,
      })
      .from(workOrders)
      .innerJoin(vehicles, eq(workOrders.vehicleId, vehicles.id))
      .where(eq(workOrders.id, workOrderId))
      .all();

    const wo = woList[0];
    if (!wo) {
      throw new NotFoundError("Pesanan kerja (Work order) tidak dijumpai.");
    }

    const now = new Date().toISOString();
    const discount = data.discountAmount !== undefined ? Number(data.discountAmount) : (wo.discountAmount || 0);
    const grandTotal = Math.max(0, (wo.totalPartsAmount || 0) + (wo.totalLaborAmount || 0) - discount);
    const method = data.paymentMethod || "DuitNow QR";

    // 1. Kemas kini status kad kerja
    await this.db
      .update(workOrders)
      .set({
        paymentStatus: "paid",
        paymentMethod: method,
        discountAmount: discount,
        grandTotal,
        status: "completed",
        completedAt: now,
      })
      .where(eq(workOrders.id, workOrderId))
      .run();

    // 2. Rekod komisen mekanik secara automatik jika mekanik ditugaskan & ada upah buruh
    if (wo.mechanicId && (wo.totalLaborAmount || 0) > 0) {
      const existingComm = await this.db
        .select()
        .from(mechanicCommissions)
        .where(eq(mechanicCommissions.workOrderId, workOrderId))
        .all();

      if (existingComm.length === 0) {
        const commRate = 15; // 15% standard commission
        const commAmount = Math.round((wo.totalLaborAmount * (commRate / 100)) * 100) / 100;
        await this.db
          .insert(mechanicCommissions)
          .values({
            id: `comm_${nanoid(8)}`,
            mechanicId: wo.mechanicId,
            workOrderId,
            workOrderNumber: wo.woNumber,
            plateNumber: wo.plateNumber,
            laborTotal: wo.totalLaborAmount,
            commissionPercent: commRate,
            commissionAmount: commAmount,
            status: "accrued",
            createdAt: now,
          })
          .run();
      }
    }

    return {
      message: `Bayaran sebanyak RM ${grandTotal.toFixed(2)} (${method}) berjaya disahkan.`,
      workOrderId,
      paymentStatus: "paid",
      paymentMethod: method,
      grandTotal,
      completedAt: now,
    };
  }

  async updateStatus(id: string, status: string, mechanicNotes?: string) {
    // waiting_approval DIBUANG — Foreman terus ke ready selepas QC fizikal
    const validStatuses = [
      "pending",
      "inspecting",
      "in_progress",
      "waiting_parts",
      "ready",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status '${status}' tidak sah.`);
    }

    const now = new Date().toISOString();
    await this.db
      .update(workOrders)
      .set({
        status,
        mechanicNotes: mechanicNotes !== undefined ? mechanicNotes : undefined,
        completedAt: status === "completed" ? now : undefined,
      })
      .where(eq(workOrders.id, id))
      .run();

    return { message: `Status dikemaskini kepada ${status}` };
  }
}
