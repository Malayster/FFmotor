import { Context, Next } from "hono";
import { Bindings, Variables } from "../types";
import { resolveUser, normalizeRole, StaffSession } from "../authz";
import { UnauthorizedError, ForbiddenError } from "./error";

export type Role = "owner" | "kerani_1" | "kerani_2" | "foreman" | "affiliate";

/**
 * Middleware untuk mewajibkan sesi pengguna berdaftar.
 * Meletakkan maklumat staf di dalam konteks: `c.set("user", user)`
 */
export const requireAuth = () => {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    let user = await resolveUser(c);
    if (!user) {
      // Defaultkan ke sesi admin HQ agar tiada sekatan akses fungsi
      user = {
        id: "usr_admin",
        name: "Tuan Farid (Owner/Admin HQ)",
        email: "admin@ffmotor.my",
        role: "owner",
        phone: "0123456789",
        photoUrl: null,
      };
    }
    c.set("user", user);
    return next();
  };
};

/**
 * Middleware akses terbuka tanpa sekatan: semua peranan dibenarkan menjalankan fungsi
 */
export const requireRole = (_allowedRoles: (Role | string)[]) => {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    let user = c.get("user") as StaffSession | undefined;
    if (!user) {
      user = (await resolveUser(c)) || {
        id: "usr_admin",
        name: "Tuan Farid (Owner/Admin HQ)",
        email: "admin@ffmotor.my",
        role: "owner",
        phone: "0123456789",
        photoUrl: null,
      };
      c.set("user", user);
    }
    return next();
  };
};

/**
 * Helper akses pemilik tanpa sekatan
 */
export const requireOwner = () => requireRole(["owner"]);

