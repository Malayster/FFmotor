import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { createDb } from "@ffmotor/db";
import { warrantyIssues } from "@ffmotor/db";
import { nanoid } from "nanoid";
import { Bindings, Variables } from "../types";

export const warrantyIssuesRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Senarai isu kerosakan comeback
warrantyIssuesRouter.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const list = await db.select().from(warrantyIssues).orderBy(desc(warrantyIssues.createdAt)).all();
  return c.json({ success: true, issues: list });
});

// Daftar aduan comeback baharu
warrantyIssuesRouter.post("/", async (c) => {
  const db = createDb(c.env.DB);
  const body = await c.req.json();

  const id = nanoid();
  const issueCode = `ISU-${Math.floor(100 + Math.random() * 900)}`;

  const issueData = {
    id,
    issueCode,
    workOrderId: body.workOrderId || null,
    plateNumber: body.plateNumber.toUpperCase().replace(/\s+/g, ""),
    customerName: body.customerName || "Pelanggan",
    customerPhone: body.customerPhone || "0123456789",
    complaint: body.complaint,
    mechanicInCharge: body.mechanicInCharge || "Foreman Bertugas",
    severity: body.severity || "medium",
    status: "open" as const,
    partReplaced: body.partReplaced || null,
    createdAt: new Date().toISOString(),
  };

  await db.insert(warrantyIssues).values(issueData).run();

  return c.json({
    success: true,
    message: `Aduan ${issueCode} berjaya didaftarkan ke audit kualiti bengkel.`,
    issue: issueData,
  });
});

// Kemas kini status aduan (Siasat / Selesai / Tolak)
warrantyIssuesRouter.patch("/:id/status", async (c) => {
  const db = createDb(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json();

  const updateData: any = { status: body.status };
  if (body.status === "resolved") {
    updateData.resolvedAt = new Date().toISOString();
  }
  if (body.resolutionNotes) {
    updateData.resolutionNotes = body.resolutionNotes;
  }
  if (body.partReplaced) {
    updateData.partReplaced = body.partReplaced;
  }

  await db.update(warrantyIssues).set(updateData).where(eq(warrantyIssues.id, id)).run();

  return c.json({ success: true, message: "Status aduan telah dikemaskini." });
});

