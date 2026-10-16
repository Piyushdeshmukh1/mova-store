import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, orders } from "@/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";

/**
 * Configure in Razorpay Dashboard → Webhooks:
 *   URL: https://your-domain/api/webhooks/razorpay
 *   Events: payment.captured, payment.failed, refund.processed
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, sig)) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const evt = JSON.parse(raw);
  const payment = evt?.payload?.payment?.entity;
  try {
    if (evt.event === "payment.captured" && payment?.order_id) {
      await markOrderPaid({ razorpayOrderId: payment.order_id }, payment.id);
    } else if (evt.event === "payment.failed" && payment?.order_id) {
      await db.update(orders).set({ paymentStatus: "failed", updatedAt: new Date() }).where(eq(orders.razorpayOrderId, payment.order_id));
    } else if (evt.event === "refund.processed") {
      const pid = evt?.payload?.refund?.entity?.payment_id;
      if (pid) await db.update(orders).set({ paymentStatus: "refunded", updatedAt: new Date() }).where(eq(orders.razorpayPaymentId, pid));
    }
  } catch (e) {
    console.error("[webhook]", e);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
