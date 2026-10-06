import { Context, Next } from "hono";
import { Bindings, Variables } from "../types";
import { resolveUser, normalizeRole, StaffSession } from "../authz";
import { UnauthorizedError, ForbiddenError } from "./error";

export type Role = "owner" | "kerani_1" | "kerani_2" | "foreman" | "affiliate";

export const requireAuth = () => {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const user = await resolveUser(c);
    if (!user) {
      throw new UnauthorizedError("Sesi staf diperlukan. Log masuk dengan PIN stesen.");
    }
    c.set("user", user);
    return next();
  };
};

export const requireRole = (allowedRoles: (Role | string)[]) => {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const existing = c.get("user") as StaffSession | undefined;
    const user = existing || (await resolveUser(c));
    if (!user) {
      throw new UnauthorizedError("Sesi staf diperlukan. Log masuk dengan PIN stesen.");
    }
    const role = normalizeRole(user.role);
    const allowed = new Set(allowedRoles.map((item) => normalizeRole(String(item))));
    if (!allowed.has(role) && role !== "owner") {
      throw new ForbiddenError("Peranan ini tidak dibenarkan untuk modul tersebut.");
    }
    c.set("user", user);
    return next();
  };
};

export const requireOwner = () => {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const existing = c.get("user") as StaffSession | undefined;
    const user = existing || (await resolveUser(c));
    if (!user) throw new UnauthorizedError("Sesi staf diperlukan.");
    if (normalizeRole(user.role) !== "owner") {
      throw new ForbiddenError("Hanya pemilik boleh buka modul ini.");
    }
    c.set("user", user);
    return next();
  };
};
