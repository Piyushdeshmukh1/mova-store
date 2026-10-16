"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import type { Spec } from "@/db/schema";
import { useCart, useWishlist } from "@/lib/store";
import { cn, formatINR, variantPricing } from "@/lib/utils";
import { SmartImage } from "./SmartImage";
import { Stars } from "./Stars";

type V = { id: number; color: string | null; colorHex: string | null; size: string | null; price: number | null; salePrice: number | null; stock: number };
type P = {
  id: number; name: string; slug: string; price: number; salePrice: number | null; stock: number; images: string[];
  shortDescription: string | null; description: string; specifications: Spec[]; badge: string | null;
  categoryName: string | null; rating: number; reviewCount: number; variants: V[];
};

const uniq = <T,>(a: (T | null)[]) => [...new Set(a.filter((x): x is T => x != null))];

export function ProductDetail({ p, shippingInfo, returnInfo, trustBadges, deliveryText }: {
  p: P; shippingInfo: string; returnInfo: string; trustBadges: { text: string }[]; deliveryText: string;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const toggleWish = useWishlist((s) => s.toggle);

  const colors = useMemo(() => uniq(p.variants.map((v) => v.color)), [p.variants]);
  const sizes = useMemo(() => uniq(p.variants.map((v) => v.size)), [p.variants]);
  const firstInStock = p.variants.find((v) => v.stock > 0) ?? p.variants[0];
  const [color, setColor] = useState<string | null>(firstInStock?.color ?? null);
  const [size, setSize] = useState<string | null>(firstInStock?.size ?? null);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState<string | null>("details");

  const variant = p.variants.length ? p.variants.find((v) => (v.color ?? null) === color && (v.size ?? null) === size) ?? null : null;
  const { selling, mrp, off } = variantPricing(p, variant);
  const stock = p.variants.length ? variant?.stock ?? 0 : p.stock;
  const needsChoice = p.variants.length > 0 && !variant;
  const images = p.images.length ? p.images : [""];

  const sizeAvailable = (s: string) => p.variants.some((v) => v.size === s && (colors.length === 0 || v.color === color) && v.stock > 0);
  const colorAvailable = (c: string) => p.variants.some((v) => v.color === c && v.stock > 0);

  function addToBag(goCheckout = false) {
    if (needsChoice || stock <= 0) return;
    add({
      productId: p.id, variantId: variant?.id ?? null, name: p.name, slug: p.slug, image: p.images[0] ?? null,
      variantLabel: variant ? [variant.color, variant.size].filter(Boolean).join(" / ") : null, price: selling, mrp,
    }, qty);
    if (goCheckout) { useCart.getState().openDrawer(false); router.push("/checkout"); }
    else { setAdded(true); setTimeout(() => setAdded(false), 1800); }
  }

  const panels = [
    { id: "details", title: "Description", body: <div className="space-y-4 whitespace-pre-line">{p.description}</div> },
    p.specifications.length > 0 && {
      id: "specs", title: "Specifications",
      body: <dl className="divide-y divide-forest/10">{p.specifications.map((s) => (
        <div key={s.label} className="flex justify-between gap-6 py-2.5"><dt className="text-sage">{s.label}</dt><dd className="text-right font-medium text-charcoal">{s.value}</dd></div>
      ))}</dl>,
    },
    shippingInfo && { id: "shipping", title: "Shipping", body: <p>{shippingInfo}</p> },
    returnInfo && { id: "returns", title: "Returns & exchanges", body: <p>{returnInfo}</p> },
  ].filter(Boolean) as { id: string; title: string; body: React.ReactNode }[];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="no-scrollbar flex gap-3 overflow-x-auto md:w-20 md:flex-col">
            {images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} aria-label={`View image ${i + 1}`} aria-current={img === i}
                className={cn("h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-cream-200 transition", img === i ? "border-forest" : "border-transparent opacity-70 hover:opacity-100")}>
                <SmartImage src={src} alt="" className="h-full w-full" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-[2rem] bg-cream-200"
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
            onMouseLeave={() => setZoom(null)}>
            <div className="aspect-square md:aspect-[4/5]">
              <SmartImage key={img} src={images[img]} alt={p.name} eager
                className="h-full w-full animate-fade transition-transform duration-300 ease-out"
              />
              {zoom && images[img] && (
                <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-no-repeat md:block"
                  style={{ backgroundImage: `url(${images[img]})`, backgroundSize: "200%", backgroundPosition: `${zoom.x}% ${zoom.y}%` }} />
              )}
            </div>
            <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
              {off > 0 && <span className="badge bg-coral text-charcoal">{off}% off</span>}
              {p.badge && <span className="badge bg-cream text-forest">{p.badge}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div>
        {p.categoryName && <p className="text-sm font-semibold text-sage">{p.categoryName}</p>}
        <h1 className="mt-2 text-display-md uppercase">{p.name}</h1>
        {p.reviewCount > 0 && (
          <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-sage hover:text-forest">
            <Stars value={p.rating} /> <span>{p.rating.toFixed(1)} · {p.reviewCount} reviews</span>
          </a>
        )}
        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="font-display text-4xl font-extrabold tracking-tight text-forest">{formatINR(selling)}</span>
          {off > 0 && <><span className="price-mrp text-lg">MRP {formatINR(mrp)}</span><span className="rounded-full bg-coral-100 px-3 py-1 text-sm font-bold text-coral-600">Save {formatINR(mrp - selling)}</span></>}
        </div>
        <p className="mt-1 text-xs text-sage">Inclusive of all taxes</p>
        {p.shortDescription && <p className="mt-6 text-lg leading-relaxed text-charcoal/75">{p.shortDescription}</p>}

        {colors.length > 0 && (
          <fieldset className="mt-8">
            <legend className="text-sm font-semibold text-charcoal">Colour: <span className="font-normal text-sage">{color}</span></legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {colors.map((c) => {
                const hex = p.variants.find((v) => v.color === c)?.colorHex || "#ccc";
                const ok = colorAvailable(c);
                return (
                  <button key={c} onClick={() => { setColor(c); const s = p.variants.find((v) => v.color === c && v.stock > 0)?.size; if (s !== undefined) setSize(s); }}
                    aria-label={`${c}${ok ? "" : " (sold out)"}`} aria-pressed={color === c}
                    className={cn("relative grid h-11 w-11 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-cream transition", color === c ? "ring-forest" : "ring-transparent hover:ring-sage-200", !ok && "opacity-40")}>
                    <span className="h-full w-full rounded-full border border-forest/10" style={{ background: hex }} />
                    {!ok && <span className="absolute h-[2px] w-12 rotate-45 bg-charcoal/60" />}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {sizes.length > 0 && (
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-charcoal">Size</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => {
                const ok = sizeAvailable(s);
                return (
                  <button key={s} onClick={() => setSize(s)} aria-pressed={size === s} disabled={!ok}
                    className={cn("rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition", size === s ? "border-forest bg-forest text-cream" : "border-forest/15 bg-white text-forest hover:border-forest",
                      !ok && "cursor-not-allowed border-dashed line-through opacity-50")}>
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <p className={cn("mt-6 text-sm font-medium", stock > 0 && stock <= 10 ? "text-coral-600" : stock > 0 ? "text-forest" : "text-sage")}>
          {needsChoice ? "This combination isn't available." : stock <= 0 ? "Sold out" : stock <= 10 ? `Only ${stock} left. Order soon.` : "In stock, ready to ship"}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center rounded-full border-2 border-forest/15 bg-white">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-14 w-12 place-items-center" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
            <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(Math.max(1, stock), q + 1, 20))} className="grid h-14 w-12 place-items-center" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
          </div>
          <button onClick={() => addToBag()} disabled={needsChoice || stock <= 0} className="btn-primary flex-1">
            {added ? <><Check className="h-4 w-4" /> Added to bag</> : "Add to bag"}
          </button>
          <button onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="grid h-14 w-14 place-items-center rounded-full border-2 border-forest/15 bg-white text-forest transition hover:border-coral">
            <Heart className={cn("h-5 w-5", wished && "animate-pop fill-coral text-coral")} />
          </button>
        </div>
        <button onClick={() => addToBag(true)} disabled={needsChoice || stock <= 0} className="btn-coral mt-3 w-full">Buy now</button>

        <ul className="mt-8 grid gap-3 rounded-[1.5rem] bg-mint-200/70 p-5 text-sm text-forest sm:grid-cols-3">
          {trustBadges.map((b, i) => {
            const I = [Truck, RotateCcw, ShieldCheck][i % 3];
            return <li key={i} className="flex items-center gap-2.5"><I className="h-5 w-5 shrink-0" strokeWidth={1.8} />{b.text}</li>;
          })}
        </ul>
        {deliveryText && <p className="mt-3 text-sm text-sage">{deliveryText}</p>}

        <div className="mt-8 divide-y divide-forest/10 border-y border-forest/10">
          {panels.map((pn) => (
            <div key={pn.id}>
              <button onClick={() => setOpen(open === pn.id ? null : pn.id)} aria-expanded={open === pn.id}
                className="flex w-full items-center justify-between py-5 text-left font-display text-[15px] font-bold uppercase tracking-wide text-forest">
                {pn.title}<ChevronDown className={cn("h-5 w-5 transition-transform duration-300", open === pn.id && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-300", open === pn.id ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden text-[15px] leading-relaxed text-charcoal/80">{pn.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
