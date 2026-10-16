"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/store";

export type PricedCart = {
  lines: { productId: number; variantId: number | null; name: string; variantLabel: string | null; image: string | null; unitPrice: number; mrp: number; quantity: number; available: number }[];
  subtotal: number; mrpTotal: number; discount: number; couponCode: string | null; couponError: string | null;
  shipping: number; codFee: number; total: number; errors: string[]; codEnabled: boolean; freeShippingThreshold: number;
};

/** Asks the server to price the bag (the server is always the source of truth for prices). */
export function usePricedCart(paymentMethod: "razorpay" | "cod" = "razorpay") {
  const items = useCart((s) => s.items);
  const couponCode = useCart((s) => s.couponCode);
  const [data, setData] = useState<PricedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const sig = JSON.stringify(items.map((i) => [i.productId, i.variantId, i.quantity])) + couponCode + paymentMethod;
  useEffect(() => {
    if (!hydrated) return;
    if (!items.length) { setData(null); setLoading(false); return; }
    const ctrl = new AbortController();
    setLoading(true);
    fetch("/api/cart/price", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
      body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })), couponCode: couponCode || null, paymentMethod }),
    })
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, hydrated]);

  return { data, loading: loading || !hydrated, hydrated };
}
