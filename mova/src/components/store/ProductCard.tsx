"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, Loader2, Plus } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { useCart, useWishlist } from "@/lib/store";
import { cn, formatINR, pricing } from "@/lib/utils";
import { SmartImage } from "./SmartImage";
import { Stars } from "./Stars";

export function ProductCard({ p, tone = "light", priority }: { p: CardProduct; tone?: "light" | "dark"; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggle = useWishlist((s) => s.toggle);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { selling, mrp, off } = pricing(p.price, p.salePrice);
  const soldOut = p.stock <= 0;
  const dark = tone === "dark";

  async function quickAdd() {
    setErr("");
    if (p.variantCount === 0) {
      add({ productId: p.id, variantId: null, name: p.name, slug: p.slug, image: p.images[0] ?? null, variantLabel: null, price: selling, mrp });
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/products/quick?id=${p.id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      add({ productId: p.id, variantId: d.variantId, name: p.name, slug: p.slug, image: p.images[0] ?? null, variantLabel: d.label, price: d.price, mrp: d.mrp });
    } catch (e) {
      setErr((e as Error).message || "Couldn't add. Try again.");
    } finally { setBusy(false); }
  }

  return (
    <article className="group relative flex flex-col">
      <div className={cn("relative aspect-[4/5] overflow-hidden rounded-[1.75rem]", dark ? "bg-forest-600" : "bg-cream-200")}>
        <Link href={`/p/${p.slug}`} aria-label={p.name} className="absolute inset-0">
          <SmartImage src={p.images[0]} alt={p.name} eager={priority}
            className="absolute inset-0 h-full w-full transition duration-700 ease-out group-hover:scale-[1.06]" />
          {p.images[1] && (
            <SmartImage src={p.images[1]} alt="" className="absolute inset-0 h-full w-full opacity-0 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100" />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && <span className="badge bg-coral text-charcoal">{off}% off</span>}
          {p.badge && <span className="badge bg-cream text-forest">{p.badge}</span>}
        </div>

        <button onClick={() => toggle(p.id)} aria-pressed={wished} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-forest backdrop-blur transition hover:scale-110">
          <Heart className={cn("h-[18px] w-[18px] transition", wished && "animate-pop fill-coral text-coral")} />
        </button>

        <div className="absolute inset-x-3 bottom-3 translate-y-0 transition duration-500 md:translate-y-[130%] md:group-hover:translate-y-0 md:group-focus-within:translate-y-0">
          <button onClick={quickAdd} disabled={soldOut || busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-cream shadow-lg transition hover:bg-charcoal disabled:bg-sage">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {soldOut ? "Sold out" : "Quick add"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col px-1">
        {p.categoryName && <p className={cn("text-xs font-medium", dark ? "text-mint/80" : "text-sage")}>{p.categoryName}</p>}
        <h3 className={cn("mt-1 font-display text-[17px] font-bold leading-snug tracking-tight", dark ? "text-cream" : "text-forest")}>
          <Link href={`/p/${p.slug}`} className="hover:underline hover:decoration-coral hover:decoration-2 hover:underline-offset-4">{p.name}</Link>
        </h3>
        {p.reviewCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars value={p.rating} size={13} />
            <span className={cn("text-xs", dark ? "text-cream/60" : "text-sage")}>{p.rating.toFixed(1)} ({p.reviewCount})</span>
          </div>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className={cn("text-[17px] font-semibold", dark ? "text-cream" : "text-charcoal")}>{formatINR(selling)}</span>
          {off > 0 && <span className="price-mrp text-sm">{formatINR(mrp)}</span>}
        </div>
        {err && <p className="mt-1 text-xs text-coral-600" role="alert">{err}</p>}
      </div>
    </article>
  );
}
