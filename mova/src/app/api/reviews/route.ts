import { NextResponse } from "next/server";
import { z } from "zod";
import { db, reviews } from "@/db";
import { rateLimit } from "@/lib/auth";

const schema = z.object({
  productId: z.number().int().positive(), rating: z.number().int().min(1).max(5),
  name: z.string().trim().min(2).max(60), title: z.string().trim().max(80).optional().nullable(), body: z.string().trim().min(10, "Your review needs at least 10 characters.").max(1500),
});

export async function POST(req: Request) {
  if (!rateLimit("review", 5)) return NextResponse.json({ error: "Too many reviews. Try again later." }, { status: 429 });
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  await db.insert(reviews).values({ ...p.data, title: p.data.title || null, isApproved: false });
  return NextResponse.json({ ok: true });
}
