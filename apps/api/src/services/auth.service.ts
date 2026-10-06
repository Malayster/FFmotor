import { eq } from "drizzle-orm";
import { users } from "@ffmotor/db";
import { normalizeRole } from "../authz";
import { UnauthorizedError } from "../middlewares/error";

// Dictionary sokongan cepat untuk terminal bengkel
export const ZERO_TRUST_STAFF_PIN: Record<string, { userId: string; name: string; role: string; email: string }> = {
  "8899": { userId: "usr_admin",    name: "Tuan Farid (Owner/Admin HQ)",           role: "owner",     email: "admin@ffmotor.my" },
  "3344": { userId: "usr_kerani1",  name: "Aiman Hakimi (Kerani 1 Kaunter / SA)", role: "kerani_1",  email: "aiman@ffmotor.my" },
  "2233": { userId: "usr_kerani2",  name: "Fauzi (Kerani 2 Stor / Inventori)",    role: "kerani_2",  email: "fauzi@ffmotor.my" },
  "1122": { userId: "usr_foreman",  name: "Abang Din (Ketua Foreman)",             role: "foreman",   email: "din@ffmotor.my"   },
  "5566": { userId: "usr_affiliate",name: "Zack (Affiliate / Jualan Showroom)",   role: "affiliate", email: "zack@ffmotor.my"  },
};

export class AuthService {
  constructor(private db: any) {}

  async loginWithEmail(email: string, passwordHash: string) {
    const userList = await this.db.select().from(users).where(eq(users.email, email)).all();
    const user = userList[0];

    if (!user || user.passwordHash !== passwordHash) {
      throw new UnauthorizedError("Email atau kata laluan tidak sah.");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        phone: user.phone,
      },
      token: `demo_token_${user.id}`,
    };
  }

  async verifyPinOrZeroTrust(params: {
    pin?: string;
    cfAccessEmail?: string;
    requestedRole?: string;
    ip?: string;
    country?: string;
  }) {
    const { pin, cfAccessEmail, requestedRole, ip, country } = params;

    // 1. Semak padanan PIN dalam pangkalan data
    if (pin) {
      const matchedPin = await this.db.select().from(users).where(eq(users.pinCode, String(pin))).all();
      const pinUser = matchedPin.find((u: any) => u.isActive);
      if (pinUser) {
        return {
          method: "terminal_pin",
          user: {
            id: pinUser.id,
            name: pinUser.name,
            email: pinUser.email,
            role: normalizeRole(pinUser.role),
            phone: pinUser.phone,
            photoUrl: pinUser.photoUrl,
          },
          token: `zt_pin_${pinUser.id}_${Date.now()}`,
        };
      }
    }

    // 2. Semak Cloudflare Access Email jika ada
    if (cfAccessEmail) {
      const matched = await this.db.select().from(users).where(eq(users.email, cfAccessEmail)).all();
      const user = matched[0];
      if (user && user.isActive) {
        return {
          method: "cloudflare_access_jwt",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: normalizeRole(user.role),
            phone: user.phone,
          },
          token: `zt_cf_${user.id}_${Date.now()}`,
          deviceContext: {
            ip: ip || "127.0.0.1",
            country: country || "MY",
            verifiedAt: new Date().toISOString(),
          },
        };
      }
    }

    // 3. Semak PIN Kamus Staf Pantas
    if (pin && ZERO_TRUST_STAFF_PIN[pin]) {
      const staff = ZERO_TRUST_STAFF_PIN[pin];
      return {
        method: "zero_trust_quick_pin",
        user: {
          id: staff.userId,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          phone: "017-4001122",
        },
        token: `zt_quick_${staff.userId}_${Date.now()}`,
      };
    }

    // 4. Role selector fallback bagi pembangunan cawangan
    if (requestedRole) {
      const targetPin = Object.entries(ZERO_TRUST_STAFF_PIN).find(([, val]) => val.role === requestedRole);
      if (targetPin) {
        const staff = targetPin[1];
        return {
          method: "role_switch",
          user: {
            id: staff.userId,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            phone: "017-4001122",
          },
          token: `zt_switch_${staff.userId}_${Date.now()}`,
        };
      }
    }

    throw new UnauthorizedError("PIN tidak sah atau tidak mempunyai akses.");
  }
}

