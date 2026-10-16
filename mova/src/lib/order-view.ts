import "server-only";
import { and, eq } from "drizzle-orm";
import { db, orders } from "@/db";

/** Look up an order for a shopper; the email must match (prevents enumeration of order numbers). */
export async function findOrderForShopper(orderNumber: string, email: string) {
  if (!orderNumber || !email) return null;
  const o = await db.query.orders.findFirst({
    where: and(eq(orders.orderNumber, orderNumber.trim().toUpperCase()), eq(orders.email, email.trim().toLowerCase())),
    with: { items: true },
  });
  return o ?? null;
}

export const SHIP_STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

export function shipIndex(status: string) {
  const map: Record<string, number> = { unfulfilled: 0, packed: 1, shipped: 2, in_transit: 3, delivered: 4 };
  return map[status] ?? 0;
}
