import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCart } from "@/lib/orders";
import { cartItemsSchema } from "@/lib/validation";
import { getSettings } from "@/lib/cms";

const body = z.object({ items: cartItemsSchema, couponCode: z.string().max(40).optional().nullable(), paymentMethod: z.enum(["razorpay", "cod"]).optional() });

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  const [priced, s] = await Promise.all([
    priceCart(parsed.data.items, parsed.data.couponCode, parsed.data.paymentMethod ?? "razorpay"),
    getSettings(),
  ]);
  return NextResponse.json({ ...priced, codEnabled: s.commerce.codEnabled, freeShippingThreshold: s.commerce.freeShippingThreshold });
}
