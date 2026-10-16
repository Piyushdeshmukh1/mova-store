"use server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, customers } from "@/db";
import { clearSession, rateLimit, setSession } from "@/lib/auth";

export type AuthState = { error?: string } | undefined;

const reg = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100),
});

export async function registerAction(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!rateLimit("register", 10)) return { error: "Too many attempts. Please wait a few minutes." };
  const p = reg.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  const [existing] = await db.select().from(customers).where(eq(customers.email, p.data.email)).limit(1);
  if (existing?.passwordHash) return { error: "An account with this email already exists. Please sign in." };
  const passwordHash = await bcrypt.hash(p.data.password, 11);
  // Guest checkouts create a customer row without a password; registering claims it (and its order history).
  const [c] = existing
    ? await db.update(customers).set({ name: p.data.name, passwordHash }).where(eq(customers.id, existing.id)).returning()
    : await db.insert(customers).values({ name: p.data.name, email: p.data.email, passwordHash }).returning();
  await setSession({ sub: String(c.id), email: c.email, name: c.name ?? undefined, role: "customer" });
  redirect("/account");
}

export async function loginAction(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!rateLimit("customer-login")) return { error: "Too many attempts. Please wait a few minutes." };
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const [c] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  if (!c?.passwordHash || !(await bcrypt.compare(password, c.passwordHash))) return { error: "Email or password is incorrect." };
  await setSession({ sub: String(c.id), email: c.email, name: c.name ?? undefined, role: "customer" });
  redirect("/account");
}

export async function logoutAction() {
  clearSession("customer");
  redirect("/account");
}
