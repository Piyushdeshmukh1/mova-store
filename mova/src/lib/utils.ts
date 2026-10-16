import clsx, { type ClassValue } from "clsx";

export const cn = (...c: ClassValue[]) => clsx(c);

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatINR = (n: number) => inr.format(n);

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 150);
}

/** Effective selling price and discount percentage */
export function pricing(price: number, salePrice?: number | null) {
  const selling = salePrice && salePrice > 0 && salePrice < price ? salePrice : price;
  const off = selling < price ? Math.round(((price - selling) / price) * 100) : 0;
  return { selling, mrp: price, off };
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function orderNumber() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `MV${t}${r}`;
}

/** Resolve price for a product + optional variant (variant overrides win). */
export function variantPricing(
  p: { price: number; salePrice: number | null },
  v?: { price: number | null; salePrice: number | null } | null,
) {
  if (!v) return pricing(p.price, p.salePrice);
  const mrp = v.price ?? p.price;
  const sale = v.salePrice ?? (v.price ? null : p.salePrice);
  return pricing(mrp, sale);
}
