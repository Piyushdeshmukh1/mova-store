import { NextResponse } from "next/server";
import { z } from "zod";
import { db, contactMessages } from "@/db";
import { rateLimit } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional().default(""), message: z.string().trim().min(10, "Tell us a little more (10+ characters).").max(3000),
  company: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request) {
  if (!rateLimit("contact", 5)) return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  const { company: _hp, ...data } = p.data;
  await db.insert(contactMessages).values({ ...data, phone: data.phone || null });
  return NextResponse.json({ ok: true });
}
