import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, products, productVariants, coupons, orders, orderItems } from "@/db";
import { getSettings } from "./cms";
import { variantPricing } from "./utils";

export type CartInput = { productId: number; variantId?: number | null; quantity: number };

export type PricedLine = {
  productId: number; variantId: number | null; name: string; variantLabel: string | null; image: string | null;
  sku: string; unitPrice: number; mrp: number; quantity: number; available: number;
};

export async function validateCoupon(code: string | undefined | null, subtotal: number, paymentMethod?: string) {
  if (!code) return { discount: 0, coupon: null as null | typeof coupons.$inferSelect, error: null as string | null };
  const [c] = await db.select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase())).limit(1);
  const fail = (error: string) => ({ discount: 0, coupon: null, error });
  if (!c || !c.isActive) return fail("This code isn't valid.");
  if (c.expiresAt && c.expiresAt < new Date()) return fail("This code has expired.");
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return fail("This code has reached its usage limit.");
  if (subtotal < c.minOrder) return fail(`Add items worth ₹${c.minOrder - subtotal} more to use this code.`);
  if (c.prepaidOnly && paymentMethod === "cod") return fail("This code works on prepaid orders only.");
  let discount = c.type === "percent" ? Math.floor((subtotal * c.value) / 100) : c.value;
  if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { discount, coupon: c, error: null };
}

/** Re-prices a cart entirely on the server. Never trust client prices. */
export async function priceCart(items: CartInput[], couponCode?: string | null, paymentMethod: "razorpay" | "cod" = "razorpay") {
  // Merge duplicate lines so stock can't be bypassed by splitting one item across several lines.
  const merged = new Map<string, CartInput>();
  for (const i of items) {
    if (!(i.quantity > 0)) continue;
    const k = `${i.productId}:${i.variantId ?? 0}`;
    const prev = merged.get(k);
    merged.set(k, { productId: i.productId, variantId: i.variantId ?? null, quantity: (prev?.quantity ?? 0) + i.quantity });
  }
  const clean = [...merged.values()].slice(0, 50);
  const pIds = [...new Set(clean.map((i) => i.productId))];
  const vIds = clean.map((i) => i.variantId).filter((v): v is number => !!v);

  const [prods, vars, withVariants] = await Promise.all([
    pIds.length ? db.select().from(products).where(and(inArray(products.id, pIds), eq(products.isActive, true))) : [],
    vIds.length ? db.select().from(productVariants).where(inArray(productVariants.id, vIds)) : [],
    pIds.length ? db.selectDistinct({ pid: productVariants.productId }).from(productVariants).where(inArray(productVariants.productId, pIds)) : [],
  ]);
  const hasVariantSet = new Set(withVariants.map((r) => r.pid));
  const errors: string[] = [];
  const lines: PricedLine[] = [];

  for (const it of clean) {
    const p = prods.find((x) => x.id === it.productId);
    if (!p) { errors.push("An item in your bag is no longer available."); continue; }
    const v = it.variantId ? vars.find((x) => x.id === it.variantId && x.productId === p.id) : undefined;
    if (it.variantId && !v) { errors.push(`${p.name}: selected option is no longer available.`); continue; }
    if (!v && hasVariantSet.has(p.id)) { errors.push(`${p.name}: please choose an option.`); continue; }
    const { selling, mrp } = variantPricing(p, v);
    const available = v ? v.stock : p.stock;
    if (available < it.quantity) errors.push(available > 0 ? `${p.name}: only ${available} left.` : `${p.name} is sold out.`);
    lines.push({
      productId: p.id, variantId: v?.id ?? null, name: p.name,
      variantLabel: v ? [v.color, v.size].filter(Boolean).join(" / ") || null : null,
      image: p.images[0] ?? null, sku: v?.sku ?? p.sku, unitPrice: selling, mrp, quantity: it.quantity, available,
    });
  }

  const { commerce } = await getSettings();
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const mrpTotal = lines.reduce((s, l) => s + l.mrp * l.quantity, 0);
  const c = await validateCoupon(couponCode, subtotal, paymentMethod);
  const shipping = subtotal === 0 || subtotal >= commerce.freeShippingThreshold ? 0 : commerce.shippingFee;
  const codFee = paymentMethod === "cod" ? commerce.codFee : 0;
  if (paymentMethod === "cod" && !commerce.codEnabled) errors.push("Cash on Delivery is currently unavailable.");
  const total = Math.max(0, subtotal - c.discount + shipping + codFee);

  return { lines, subtotal, mrpTotal, discount: c.discount, couponCode: c.coupon?.code ?? null, couponError: c.error, shipping, codFee, total, errors };
}

/** Idempotently decrements stock and marks coupon use for an order. */
export async function commitStock(orderId: number) {
  await db.transaction(async (tx) => {
    const [o] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!o || o.stockCommitted) return;
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const it of items) {
      if (it.variantId) {
        await tx.update(productVariants).set({ stock: sql`greatest(${productVariants.stock} - ${it.quantity}, 0)` }).where(eq(productVariants.id, it.variantId));
      } else if (it.productId) {
        await tx.update(products).set({ stock: sql`greatest(${products.stock} - ${it.quantity}, 0)` }).where(eq(products.id, it.productId));
      }
    }
    if (o.couponCode) await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.code, o.couponCode));
    await tx.update(orders).set({ stockCommitted: true, updatedAt: new Date() }).where(eq(orders.id, orderId));
  });
}

export async function markOrderPaid(where: { id?: number; razorpayOrderId?: string }, paymentId: string) {
  const cond = where.id ? eq(orders.id, where.id) : eq(orders.razorpayOrderId, where.razorpayOrderId!);
  const [o] = await db.select().from(orders).where(cond).limit(1);
  if (!o) return null;
  if (o.paymentStatus !== "paid") {
    await db.update(orders).set({
      paymentStatus: "paid", razorpayPaymentId: paymentId,
      orderStatus: o.orderStatus === "pending" ? "confirmed" : o.orderStatus, updatedAt: new Date(),
    }).where(eq(orders.id, o.id));
  }
  await commitStock(o.id);
  return o;
}
