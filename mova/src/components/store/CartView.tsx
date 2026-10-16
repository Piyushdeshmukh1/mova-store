"use client";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { SmartImage } from "./SmartImage";
import { usePricedCart } from "./usePricedCart";

export function CartView({ title }: { title: string }) {
  const { items, setQty, remove, couponCode, setCoupon } = useCart();
  const { data, loading, hydrated } = usePricedCart();
  const [code, setCode] = useState(couponCode);

  if (!hydrated) return <div className="container min-h-[50vh] py-16" />;

  if (!items.length) {
    return (
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-mint-200"><ShoppingBag className="h-10 w-10 text-forest" /></div>
        <h1 className="mt-8 text-display-md uppercase">{title} is empty</h1>
        <p className="mt-3 max-w-sm text-sage">Soft things are waiting. Start with our bestsellers or build a bundle.</p>
        <Link href="/collection" className="btn-primary mt-8">Explore the collection</Link>
      </section>
    );
  }

  const lineFor = (pid: number, vid: number | null) => data?.lines.find((l) => l.productId === pid && l.variantId === vid);

  return (
    <section className="container pb-24 pt-8 md:pt-12">
      <h1 className="text-display-lg uppercase">{title}</h1>
      <p className="mt-2 text-sage">{items.reduce((s, i) => s + i.quantity, 0)} items</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          {data?.errors?.length ? (
            <div className="mb-6 rounded-2xl bg-coral-100 p-4 text-sm text-coral-600" role="alert">
              {data.errors.map((e) => <p key={e}>{e}</p>)}
            </div>
          ) : null}
          <ul className="divide-y divide-forest/10 border-y border-forest/10">
            {items.map((i) => {
              const l = lineFor(i.productId, i.variantId);
              const unit = l?.unitPrice ?? i.price;
              const mrp = l?.mrp ?? i.mrp;
              return (
                <li key={i.key} className="flex gap-4 py-6 md:gap-6">
                  <Link href={`/p/${i.slug}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl bg-cream-200 md:h-36 md:w-36">
                    <SmartImage src={i.image} alt={i.name} className="h-full w-full transition duration-500 hover:scale-105" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/p/${i.slug}`} className="font-display text-lg font-bold leading-tight text-forest hover:underline">{i.name}</Link>
                        {i.variantLabel && <p className="mt-1 text-sm text-sage">{i.variantLabel}</p>}
                        <p className="mt-2 text-sm"><span className="font-semibold text-forest">{formatINR(unit)}</span>{mrp > unit && <span className="price-mrp ml-2">{formatINR(mrp)}</span>}</p>
                      </div>
                      <button onClick={() => remove(i.key)} className="grid h-9 w-9 place-items-center rounded-full text-sage transition hover:bg-coral-100 hover:text-coral-600" aria-label={`Remove ${i.name}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center rounded-full border border-forest/15 bg-white">
                        <button onClick={() => setQty(i.key, i.quantity - 1)} className="grid h-10 w-10 place-items-center" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                        <span className="w-8 text-center font-semibold" aria-live="polite">{i.quantity}</span>
                        <button onClick={() => setQty(i.key, i.quantity + 1)} className="grid h-10 w-10 place-items-center" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                      </div>
                      <p className="font-display text-lg font-extrabold text-forest">{formatINR(unit * i.quantity)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/collection" className="mt-6 inline-block text-sm font-semibold text-forest underline decoration-mint decoration-2 underline-offset-4 hover:decoration-coral">Continue shopping</Link>
        </div>

        <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-[0_30px_60px_-40px_rgba(18,60,53,.35)] md:p-8 lg:sticky lg:top-28">
          <h2 className="text-xl uppercase">Order summary</h2>
          <form className="mt-6" onSubmit={(e) => { e.preventDefault(); setCoupon(code.trim().toUpperCase()); }}>
            <label htmlFor="coupon" className="label">Coupon code</label>
            {couponCode && data?.couponCode ? (
              <div className="flex items-center justify-between rounded-2xl bg-mint-200 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-forest"><Tag className="h-4 w-4" />{data.couponCode} applied</span>
                <button type="button" onClick={() => { setCoupon(""); setCode(""); }} aria-label="Remove coupon" className="text-forest"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WELCOME10" className="input uppercase" />
                <button className="btn-ghost shrink-0 px-5 py-3">Apply</button>
              </div>
            )}
            {couponCode && data?.couponError && <p className="mt-2 text-sm text-coral-600">{data.couponError}</p>}
          </form>

          <dl className={`mt-6 space-y-3 text-[15px] transition-opacity ${loading ? "opacity-50" : ""}`}>
            <Row label="Subtotal" value={formatINR(data?.subtotal ?? 0)} />
            {data && data.mrpTotal > data.subtotal && <Row label="You save on MRP" value={`– ${formatINR(data.mrpTotal - data.subtotal)}`} accent />}
            {!!data?.discount && <Row label="Coupon discount" value={`– ${formatINR(data.discount)}`} accent />}
            <Row label="Shipping" value={data ? (data.shipping ? formatINR(data.shipping) : "Free") : "—"} />
            <div className="flex items-baseline justify-between border-t border-forest/10 pt-4">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-3xl font-extrabold text-forest">{formatINR(data?.total ?? 0)}</dd>
            </div>
          </dl>
          {data && data.shipping > 0 && <p className="mt-3 text-xs text-sage">Add {formatINR(data.freeShippingThreshold - data.subtotal)} more for free shipping.</p>}
          <Link href="/checkout" aria-disabled={!!data?.errors?.length} className={`btn-coral mt-6 w-full ${data?.errors?.length ? "pointer-events-none opacity-50" : ""}`}>Checkout securely</Link>
          <p className="mt-3 text-center text-xs text-sage">UPI · Cards · NetBanking · Cash on Delivery</p>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-charcoal/70">{label}</dt>
      <dd className={accent ? "font-semibold text-coral-600" : "font-semibold"}>{value}</dd>
    </div>
  );
}
