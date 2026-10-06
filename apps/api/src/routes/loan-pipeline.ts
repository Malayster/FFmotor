import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "@ffmotor/db";
import { Bindings, Variables } from "../types";
import { SalesService } from "../services/sales.service";

export const loanPipelineRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const calculateLoanSchema = z.object({
  loanAmount: z.coerce.number().min(1, "Amaun pinjaman diperlukan"),
  termMonths: z.coerce.number().min(6, "Tempoh pinjaman minima 6 bulan"),
  interestRate: z.coerce.number().optional(),
});

const createLoanSchema = z.object({
  motorcycleId: z.string().min(1, "ID Motosikal diperlukan"),
  customerName: z.string().min(1, "Nama pelanggan diperlukan"),
  customerPhone: z.string().min(1, "Nombor telefon pelanggan diperlukan"),
  customerIc: z.string().optional(),
  salaryMonthly: z.coerce.number().optional(),
  depositAmount: z.coerce.number().optional(),
  loanAmount: z.coerce.number().optional(),
  loanTermMonths: z.coerce.number().optional(),
  interestRate: z.coerce.number().optional(),
  loanProvider: z.string().optional(),
  salespersonId: z.string().optional(),
  notes: z.string().optional(),
});

// Senarai permohonan pinjaman
loanPipelineRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const sales = new SalesService(db);
  const applications = await sales.listLoanApplications();
  return c.json({ success: true, applications });
});

// Kira ansuran kredit
loanPipelineRouter.post("/calculate", zValidator("json", calculateLoanSchema), async (c) => {
  const sales = new SalesService(null);
  const { loanAmount, termMonths, interestRate } = c.req.valid("json");
  const result = await sales.calculateLoan(loanAmount, termMonths, interestRate);
  return c.json({ success: true, calculation: result });
});

// Daftar permohonan pinjaman baharu
loanPipelineRouter.post("/", zValidator("json", createLoanSchema), async (c) => {
  const db = createDb(c.env.DB);
  const sales = new SalesService(db);
  const body = c.req.valid("json");
  const application = await sales.createLoanApplication(body);
  return c.json({ success: true, application }, 201);
});

// Kemaskini fasa permohonan pinjaman (Pipeline Kanban)
const updateStageHandler = async (c: any) => {
  const db = createDb(c.env.DB);
  const sales = new SalesService(db);
  const id = c.req.param("id");
  const body = await c.req.json();
  const updated = await sales.updateLoanStage(id, body.stage, body.notes);
  return c.json({ success: true, application: updated });
};

loanPipelineRouter.patch("/:id/stage", updateStageHandler);
loanPipelineRouter.put("/:id/stage", updateStageHandler);

