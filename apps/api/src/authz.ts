import { Context } from "hono";
import { createDb, users, staffSessions } from "@ffmotor/db";
import { and, eq, gt } from "drizzle-orm";
import { Bindings, Variables } from "./types";

export type StaffSession = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  photoUrl: string | null;
};

export function normalizeRole(role?: string | null): string {
  const r = (role || "").toLowerCase().trim();
  if (r === "admin" || r === "owner" || r === "hq" || r === "tauke" || r === "bos") return "owner";
  if (r === "cashier" || r === "sa" || r === "kerani" || r === "kerani1" || r === "kerani_1") return "kerani_1";
  if (r === "stor" || r === "store" || r === "kerani2" || r === "kerani_2") return "kerani_2";
  if (r === "mechanic" || r === "mekanik" || r === "chief" || r === "foreman") return "foreman";
  if (r === "sales" || r === "ejen" || r === "affiliate") return "affiliate";
  return r || "unknown";
}

const ZERO_TRUST_STAFF: Record<string, StaffSession> = {
  usr_admin: {
    id: "usr_admin",
    name: "Tuan Farid (Owner/Admin HQ)",
    email: "admin@ffmotor.my",
    role: "owner",
    phone: "0123456789",
    photoUrl: null,
  },
  usr_owner: {
    id: "usr_owner",
    name: "En. Fauzi Pazil (Pemilik HQ)",
    email: "fauzi@fpmotor.com.my",
    role: "owner",
    phone: "+60124809979",
    photoUrl: null,
  },
  usr_kerani1: {
    id: "usr_kerani1",
    name: "Aiman Hakimi (Kerani 1 Kaunter / SA)",
    email: "aiman@ffmotor.my",
    role: "kerani_1",
    phone: "0192233445",
    photoUrl: null,
  },
  usr_kerani2: {
    id: "usr_kerani2",
    name: "Fauzi (Kerani 2 Stor / Inventori)",
    email: "fauzi@ffmotor.my",
    role: "kerani_2",
    phone: "0187766554",
    photoUrl: null,
  },
  usr_foreman: {
    id: "usr_foreman",
    name: "Abang Din (Ketua Foreman)",
    email: "din@ffmotor.my",
    role: "foreman",
    phone: "0139876543",
    photoUrl: null,
  },
  usr_affiliate: {
    id: "usr_affiliate",
    name: "Zack (Affiliate / Jualan Showroom)",
    email: "zack@ffmotor.my",
    role: "affiliate",
    phone: "0194455667",
    photoUrl: null,
  },
};

export async function resolveUser(c: Context<{ Bindings: Bindings; Variables: Variables }>): Promise<StaffSession | null> {
  const header = c.req.header("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const session = await db.select().from(staffSessions).where(and(eq(staffSessions.token, token), gt(staffSessions.expiresAt, now))).get();
  if (!session) return null;
  const row = await db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!row || !row.isActive) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: normalizeRole(row.role),
    phone: row.phone,
    photoUrl: row.photoUrl,
  };
}
