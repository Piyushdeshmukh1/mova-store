import { NextResponse } from "next/server";
import { z } from "zod";
import { db, subscribers } from "@/db";
import { rateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  if (!rateLimit("newsletter", 10)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const p = z.object({ email: z.string().trim().email().max(255) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  await db.insert(subscribers).values({ email: p.data.email.toLowerCase() }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}
