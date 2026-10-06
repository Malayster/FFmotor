import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users, staffSessions } from "@ffmotor/db";
import { normalizeRole } from "../authz";
import { UnauthorizedError } from "../middlewares/error";

export const ZERO_TRUST_STAFF_PIN: Record<string, { userId: string; name: string; role: string; email: string }> = {
  "8899": { userId: "usr_admin", name: "Tuan Farid (Owner/Admin HQ)", role: "owner", email: "admin@ffmotor.my" },
  "3344": { userId: "usr_kerani1", name: "Aiman Hakimi (Kerani 1 Kaunter / SA)", role: "kerani_1", email: "aiman@ffmotor.my" },
  "2233": { userId: "usr_kerani2", name: "Fauzi (Kerani 2 Stor / Inventori)", role: "kerani_2", email: "fauzi@ffmotor.my" },
  "1122": { userId: "usr_foreman", name: "Abang Din (Ketua Foreman)", role: "foreman", email: "din@ffmotor.my" },
  "5566": { userId: "usr_affiliate", name: "Zack (Affiliate / Jualan Showroom)", role: "affiliate", email: "zack@ffmotor.my" },
};

export class AuthService {
  constructor(private db: any) {}

  private async issueSession(userId: string) {
    const token = `ses_${nanoid(24)}`;
    const now = new Date();
    const expires = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();
    await this.db.$client.prepare(`CREATE TABLE IF NOT EXISTS staff_sessions (
      token text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      expires_at text NOT NULL,
      created_at text NOT NULL
    )`).run();
    await this.db.insert(staffSessions).values({
      token,
      userId,
      expiresAt: expires,
      createdAt: now.toISOString(),
    });
    return token;
  }

  async loginWithEmail(email: string, passwordHash: string) {
    const userList = await this.db.select().from(users).where(eq(users.email, email)).all();
    const user = userList[0];
    if (!user || user.passwordHash !== passwordHash) {
      throw new UnauthorizedError("Email atau kata laluan tidak sah.");
    }
    return {
      user: { id: user.id, name: user.name, email: user.email, role: normalizeRole(user.role), phone: user.phone },
      token: await this.issueSession(user.id),
    };
  }

  async verifyPinOrZeroTrust(params: { pin?: string; cfAccessEmail?: string; requestedRole?: string; ip?: string; country?: string }) {
    const { pin, cfAccessEmail, ip, country } = params;
    if (pin) {
      const matchedPin = await this.db.select().from(users).where(eq(users.pinCode, String(pin))).all();
      const pinUser = matchedPin.find((u: any) => u.isActive);
      if (pinUser) {
        return {
          method: "terminal_pin",
          user: { id: pinUser.id, name: pinUser.name, email: pinUser.email, role: normalizeRole(pinUser.role), phone: pinUser.phone, photoUrl: pinUser.photoUrl },
          token: await this.issueSession(pinUser.id),
        };
      }
    }
    if (cfAccessEmail) {
      const matched = await this.db.select().from(users).where(eq(users.email, cfAccessEmail)).all();
      const user = matched[0];
      if (user && user.isActive) {
        return {
          method: "cloudflare_access_jwt",
          user: { id: user.id, name: user.name, email: user.email, role: normalizeRole(user.role), phone: user.phone },
          token: await this.issueSession(user.id),
          deviceContext: { ip: ip || "127.0.0.1", country: country || "MY", verifiedAt: new Date().toISOString() },
        };
      }
    }
    throw new UnauthorizedError("PIN tidak sah atau tidak mempunyai akses.");
  }
}
