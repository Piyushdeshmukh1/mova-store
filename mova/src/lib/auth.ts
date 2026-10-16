import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, CUSTOMER_COOKIE, signSession, verifySession, type SessionPayload } from "./session";

const cookieOpts = (days: number) => ({
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: days * 86400,
});

export async function setSession(p: SessionPayload) {
  const days = p.role === "admin" ? 1 : 30;
  cookies().set(p.role === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE, await signSession(p, days), cookieOpts(days));
}
export function clearSession(role: SessionPayload["role"]) {
  cookies().delete(role === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE);
}

export async function getAdmin() {
  const s = await verifySession(cookies().get(ADMIN_COOKIE)?.value);
  return s?.role === "admin" ? s : null;
}

/** Use at the top of every admin server action / page. */
export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

export async function getCustomer() {
  const s = await verifySession(cookies().get(CUSTOMER_COOKIE)?.value);
  return s?.role === "customer" ? s : null;
}

/* Best-effort in-memory rate limiter for login/contact endpoints.
   For multi-instance deployments, swap with Upstash/Redis. */
const hits = new Map<string, { n: number; t: number }>();
export function rateLimit(bucket: string, max = 8, windowMs = 10 * 60 * 1000) {
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const k = `${bucket}:${ip}`;
  const now = Date.now();
  const h = hits.get(k);
  if (!h || now - h.t > windowMs) { hits.set(k, { n: 1, t: now }); return true; }
  h.n++;
  return h.n <= max;
}
