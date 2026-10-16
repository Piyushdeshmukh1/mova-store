import { NextResponse } from "next/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { db, products, productVariants } from "@/db";
import { variantPricing } from "@/lib/utils";

/** Returns the first in-stock variant for "Quick add" on product cards. */
export async function GET(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const [p] = await db.select().from(products).where(and(eq(products.id, id), eq(products.isActive, true))).limit(1);
  if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const [v] = await db.select().from(productVariants).where(and(eq(productVariants.productId, id), gt(productVariants.stock, 0))).orderBy(asc(productVariants.position), asc(productVariants.id)).limit(1);
  if (!v) return NextResponse.json({ error: "Sold out" }, { status: 409 });
  const { selling, mrp } = variantPricing(p, v);
  return NextResponse.json({ variantId: v.id, label: [v.color, v.size].filter(Boolean).join(" / "), price: selling, mrp });
}
