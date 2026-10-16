/** Edge-safe JWT helpers (used by middleware and server code). */
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "mova_admin";
export const CUSTOMER_COOKIE = "mova_customer";

export type SessionPayload = { sub: string; email: string; name?: string; role: "admin" | "customer" };

function key() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set (32+ chars) in production");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please-0000");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(p: SessionPayload, days = 7) {
  return new SignJWT({ email: p.email, name: p.name, role: p.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${days}d`)
    .sign(key());
}

export async function verifySession(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return { sub: String(payload.sub), email: String(payload.email), name: payload.name as string | undefined, role: payload.role as SessionPayload["role"] };
  } catch {
    return null;
  }
}
