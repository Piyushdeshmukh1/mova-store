"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { SmartImage } from "./SmartImage";

export function CartDrawer({ freeShippingThreshold, bagLabel }: { freeShippingThreshold: number; bagLabel: string }) {
  const { items, drawerOpen, openDrawer, setQty, remove } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / Math.max(1, freeShippingThreshold)) * 100);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && openDrawer(false);
    if (drawerOpen) { document.body.style.overflow = "hidden"; window.addEventListener("keydown", onKey); }
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [drawerOpen, openDrawer]);

  if (!drawerOpen) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={bagLabel}>
      <button className="absolute inset-0 animate-fade bg-charcoal/40 backdrop-blur-sm" onClick={() => openDrawer(false)} aria-label="Close bag" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[440px] animate-slidein flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="font-display text-xl font-extrabold tracking-tight">{bagLabel} <span className="text-sage">({items.length})</span></h2>
          <button onClick={() => openDrawer(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-mint/40" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        {items.length > 0 && (
          <div className="mx-6 rounded-2xl bg-mint-200 p-4">
            <p className="text-sm font-medium text-forest">
              {remaining > 0 ? <>You&apos;re <strong>{formatINR(remaining)}</strong> away from free shipping</> : <>You&apos;ve unlocked <strong>free shipping</strong></>}
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-cream">
              <div className="h-full rounded-full bg-forest transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-mint-200"><ShoppingBag className="h-8 w-8 text-forest" /></div>
              <p className="mt-5 font-display text-lg font-bold text-forest">Your bag is empty</p>
              <p className="mt-1 text-sm text-sage">Add something soft to get started.</p>
              <Link href="/collection" onClick={() => openDrawer(false)} className="btn-primary mt-6">Shop the collection</Link>
            </div>
          ) : (
            <ul className="divide-y divide-forest/10">
              {items.map((i) => (
                <li key={i.key} className="flex gap-4 py-4">
                  <Link href={`/p/${i.slug}`} onClick={() => openDrawer(false)} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream-200">
                    <SmartImage src={i.image} alt={i.name} className="h-full w-full" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link href={`/p/${i.slug}`} onClick={() => openDrawer(false)} className="font-display text-[15px] font-bold leading-tight text-forest hover:underline">{i.name}</Link>
                      <button onClick={() => remove(i.key)} className="text-sage hover:text-coral" aria-label={`Remove ${i.name}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                    {i.variantLabel && <p className="mt-0.5 text-xs text-sage">{i.variantLabel}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-forest/15 bg-white">
                        <button onClick={() => setQty(i.key, i.quantity - 1)} className="grid h-8 w-8 place-items-center" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-6 text-center text-sm font-semibold">{i.quantity}</span>
                        <button onClick={() => setQty(i.key, i.quantity + 1)} className="grid h-8 w-8 place-items-center" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-forest">{formatINR(i.price * i.quantity)}</p>
                        {i.mrp > i.price && <p className="price-mrp text-xs">{formatINR(i.mrp * i.quantity)}</p>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-forest/10 bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-sage">Subtotal</span>
              <span className="font-display text-2xl font-extrabold text-forest">{formatINR(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-sage">Shipping and coupons are applied at checkout.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/cart" onClick={() => openDrawer(false)} className="btn-ghost px-4">View bag</Link>
              <Link href="/checkout" onClick={() => openDrawer(false)} className="btn-coral px-4">Checkout</Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
