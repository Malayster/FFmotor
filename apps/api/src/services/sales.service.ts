import { eq, desc } from "drizzle-orm";
import { loanApplications, motorcycles, users } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { NotFoundError, ValidationError } from "../middlewares/error";

export class SalesService {
  constructor(private db: any) {}

  async listLoanApplications() {
    return this.db
      .select({
        id: loanApplications.id,
        appNumber: loanApplications.appNumber,
        motorcycleId: loanApplications.motorcycleId,
        customerName: loanApplications.customerName,
        customerPhone: loanApplications.customerPhone,
        customerIc: loanApplications.customerIc,
        salaryMonthly: loanApplications.salaryMonthly,
        depositAmount: loanApplications.depositAmount,
        loanAmount: loanApplications.loanAmount,
        loanTermMonths: loanApplications.loanTermMonths,
        monthlyInstallment: loanApplications.monthlyInstallment,
        loanProvider: loanApplications.loanProvider,
        stage: loanApplications.stage,
        salespersonId: loanApplications.salespersonId,
        notes: loanApplications.notes,
        createdAt: loanApplications.createdAt,
        updatedAt: loanApplications.updatedAt,
        brand: motorcycles.brand,
        model: motorcycles.model,
        color: motorcycles.color,
        chassisNo: motorcycles.chassisNo,
        sellingPrice: motorcycles.sellingPrice,
        salespersonName: users.name,
      })
      .from(loanApplications)
      .leftJoin(motorcycles, eq(loanApplications.motorcycleId, motorcycles.id))
      .leftJoin(users, eq(loanApplications.salespersonId, users.id))
      .orderBy(desc(loanApplications.createdAt))
      .all();
  }

  async calculateLoan(loanAmount: number, termMonths: number, interestRate = 8.5) {
    const rate = interestRate / 100;
    const years = termMonths / 12;
    const totalInterest = loanAmount * rate * years;
    const totalPayable = loanAmount + totalInterest;
    const monthlyInstallment = Math.round((totalPayable / termMonths) * 100) / 100;

    return {
      loanAmount,
      termMonths,
      interestRate,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
      monthlyInstallment,
    };
  }

  async createLoanApplication(data: {
    motorcycleId: string;
    customerName: string;
    customerPhone: string;
    customerIc?: string;
    salaryMonthly?: number;
    depositAmount?: number;
    loanAmount?: number;
    loanTermMonths?: number;
    interestRate?: number;
    loanProvider?: string;
    salespersonId?: string;
    notes?: string;
  }) {
    if (!data.motorcycleId || !data.customerName || !data.customerPhone) {
      throw new ValidationError("Motosikal, nama pelanggan, dan nombor telefon diperlukan.");
    }

    const id = nanoid();
    const appNumber = `LOAN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const deposit = Number(data.depositAmount || 0);
    const loanAmount = Number(data.loanAmount || 0);
    const termMonths = Number(data.loanTermMonths || 36);

    const calc = await this.calculateLoan(loanAmount, termMonths, data.interestRate || 8.5);

    const appData = {
      id,
      appNumber,
      motorcycleId: data.motorcycleId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerIc: data.customerIc || "000000-00-0000",
      salaryMonthly: Number(data.salaryMonthly || 0),
      depositAmount: deposit,
      loanAmount,
      loanTermMonths: termMonths,
      monthlyInstallment: calc.monthlyInstallment,
      loanProvider: data.loanProvider || "AEON Credit Service",
      stage: "prospect" as const,
      salespersonId: data.salespersonId || "usr_sales",
      notes: data.notes || "Permohonan baru",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.db.insert(loanApplications).values(appData).run();
    return appData;
  }

  async updateLoanStage(id: string, stage: string, notes?: string) {
    const existing = await this.db.select().from(loanApplications).where(eq(loanApplications.id, id)).get();
    if (!existing) throw new NotFoundError("Permohonan pinjaman tidak dijumpai.");

    const now = new Date().toISOString();
    await this.db
      .update(loanApplications)
      .set({
        stage,
        notes: notes !== undefined ? notes : existing.notes,
        updatedAt: now,
      })
      .where(eq(loanApplications.id, id))
      .run();

    // Selaraskan status unit motor showroom mengikut fasa pinjaman
    if (existing.motorcycleId) {
      if (stage === "approved" || stage === "jpj_registered") {
        await this.db
          .update(motorcycles)
          .set({ status: "booked" })
          .where(eq(motorcycles.id, existing.motorcycleId))
          .run();
      } else if (stage === "delivered") {
        await this.db
          .update(motorcycles)
          .set({ status: "sold" })
          .where(eq(motorcycles.id, existing.motorcycleId))
          .run();
      } else if (stage === "rejected") {
        await this.db
          .update(motorcycles)
          .set({ status: "available" })
          .where(eq(motorcycles.id, existing.motorcycleId))
          .run();
      }
    }

    const updated = await this.db.select().from(loanApplications).where(eq(loanApplications.id, id)).get();
    return updated;
  }
}

