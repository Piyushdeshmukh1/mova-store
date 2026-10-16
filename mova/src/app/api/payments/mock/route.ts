import { NextResponse } from "next/server";
import { z } from "zod";
import { mockPaymentsAllowed } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";

/** Development-only simulated payment (disabled in production and whenever Razorpay keys exist). */
export async function POST(req: Request) {
  if (!mockPaymentsAllowed()) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const p = z.object({ orderId: z.number() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const o = await markOrderPaid({ id: p.data.orderId }, `mock_${Date.now()}`);
  return o ? NextResponse.json({ ok: true, orderNumber: o.orderNumber }) : NextResponse.json({ error: "Order not found" }, { status: 404 });
}
