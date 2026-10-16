import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, orders, orderItems, customers } from "@/db";
import { checkoutSchema } from "@/lib/validation";
import { priceCart, commitStock } from "@/lib/orders";
import { createRazorpayOrder, mockPaymentsAllowed, razorpayEnabled } from "@/lib/razorpay";
import { getSettings } from "@/lib/cms";
import { getCustomer } from "@/lib/auth";
import { orderNumber } from "@/lib/utils";

export async function POST(req: Request) {
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;
  const priced = await priceCart(d.items, d.couponCode, d.paymentMethod);
  if (priced.errors.length) return NextResponse.json({ error: priced.errors[0], errors: priced.errors }, { status: 409 });
  if (!priced.lines.length) return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  if (d.paymentMethod === "razorpay" && !razorpayEnabled() && !mockPaymentsAllowed()) {
    return NextResponse.json({ error: "Online payments aren't configured yet. Please choose Cash on Delivery." }, { status: 503 });
  }

  const email = d.customer.email.toLowerCase();
  const session = await getCustomer();
  const [cust] = await db.insert(customers).values({ email, name: d.customer.name, phone: d.customer.phone })
    .onConflictDoUpdate({ target: customers.email, set: { phone: d.customer.phone } }).returning();

  const number = orderNumber();
  const [order] = await db.insert(orders).values({
    orderNumber: number, customerId: session ? Number(session.sub) || cust.id : cust.id,
    email, name: d.customer.name, phone: d.customer.phone,
    shippingAddress: { ...d.address, country: "India" },
    subtotal: priced.subtotal, discount: priced.discount, shipping: priced.shipping, codFee: priced.codFee, total: priced.total,
    couponCode: priced.couponCode, paymentMethod: d.paymentMethod, notes: d.notes || null,
    orderStatus: d.paymentMethod === "cod" ? "confirmed" : "pending",
  }).returning();

  await db.insert(orderItems).values(priced.lines.map((l) => ({
    orderId: order.id, productId: l.productId, variantId: l.variantId, name: l.name, variantLabel: l.variantLabel,
    image: l.image, sku: l.sku, unitPrice: l.unitPrice, quantity: l.quantity,
  })));

  if (d.paymentMethod === "cod") {
    await commitStock(order.id);
    return NextResponse.json({ mode: "cod", orderNumber: number });
  }

  if (!razorpayEnabled()) return NextResponse.json({ mode: "mock", orderNumber: number, orderId: order.id });

  try {
    const rzp = await createRazorpayOrder(priced.total, number, { orderNumber: number });
    await db.update(orders).set({ razorpayOrderId: rzp.id }).where(eq(orders.id, order.id));
    const { site } = await getSettings();
    return NextResponse.json({
      mode: "razorpay", orderNumber: number,
      razorpay: {
        key: process.env.RAZORPAY_KEY_ID, order_id: rzp.id, amount: rzp.amount, currency: "INR",
        name: site.brandName, description: `Order ${number}`, image: site.logoUrl || undefined,
        prefill: { name: d.customer.name, email, contact: d.customer.phone }, theme: { color: "#123C35" },
      },
    });
  } catch (e) {
    console.error(e);
    await db.update(orders).set({ paymentStatus: "failed", orderStatus: "cancelled" }).where(eq(orders.id, order.id));
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 502 });
  }
}
