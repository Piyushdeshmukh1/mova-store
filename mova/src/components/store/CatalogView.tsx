import Link from "next/link";
import { Suspense } from "react";
import { getActiveCategories, listProducts, type ListOptions } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { SortSelect } from "./SortSelect";

const FILTERS: { v: ListOptions["filter"] | ""; l: string }[] = [
  { v: "", l: "All" }, { v: "bestseller", l: "Bestsellers" }, { v: "new", l: "New arrivals" }, { v: "sale", l: "On sale" },
];

export async function CatalogView({ categorySlug, sp, basePath }: { categorySlug?: string; sp: Record<string, string | undefined>; basePath: string }) {
  const filter = (["featured", "bestseller", "new", "sale"].includes(sp.filter || "") ? sp.filter : undefined) as ListOptions["filter"];
  const sort = sp.sort as ListOptions["sort"];
  const [items, cats] = await Promise.all([listProducts({ categorySlug, filter, sort, q: sp.q?.slice(0, 60) }), getActiveCategories()]);
  const qs = (patch: Record<string, string>) => {
    const n = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    const s = n.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="container pb-24">
      <div className="sticky top-16 z-20 -mx-5 mb-10 flex flex-col gap-4 bg-cream/90 px-5 py-4 backdrop-blur-lg md:mx-0 md:flex-row md:items-center md:justify-between md:px-0">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Link href={`/collection${qs({})}`} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", !categorySlug ? "bg-forest text-cream" : "bg-white text-forest hover:bg-mint-200")}>Everything</Link>
          {cats.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}${qs({})}`} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", categorySlug === c.slug ? "bg-forest text-cream" : "bg-white text-forest hover:bg-mint-200")}>{c.name}</Link>
          ))}
          <span className="mx-1 w-px shrink-0 bg-forest/15" />
          {FILTERS.map((f) => (
            <Link key={f.l} href={`${basePath}${qs({ filter: f.v || "" })}`} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
              (filter || "") === f.v ? "border-coral bg-coral-100 text-forest" : "border-forest/15 text-charcoal/70 hover:border-forest")}>{f.l}</Link>
          ))}
        </div>
        <Suspense><SortSelect /></Suspense>
      </div>

      {sp.q && <p className="mb-8 text-sage">Showing results for <strong className="text-forest">&ldquo;{sp.q}&rdquo;</strong> <Link href={basePath} className="ml-2 underline">Clear</Link></p>}

      {items.length === 0 ? (
        <div className="rounded-[2rem] bg-white py-24 text-center">
          <p className="font-display text-2xl font-extrabold text-forest">Nothing here yet</p>
          <p className="mt-2 text-sage">Try another filter or browse everything.</p>
          <Link href="/collection" className="btn-primary mt-8">See all products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
          {items.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}
        </div>
      )}
    </div>
  );
}
