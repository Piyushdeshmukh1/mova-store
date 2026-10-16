"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { useWishlist } from "@/lib/store";
import { ProductCard } from "./ProductCard";

export function WishlistView() {
  const ids = useWishlist((s) => s.ids);
  const [items, setItems] = useState<CardProduct[] | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const key = ids.join(",");
  useEffect(() => {
    if (!hydrated) return;
    if (!key) { setItems([]); return; }
    fetch(`/api/products/by-ids?ids=${key}`).then((r) => r.json()).then(setItems).catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);
  const visible = (items ?? []).filter((p) => ids.includes(p.id));

  return (
    <section className="container pb-24 pt-8 md:pt-12">
      <h1 className="text-display-lg uppercase">Wishlist</h1>
      {items === null ? (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-[1.75rem] bg-cream-200" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-coral-100"><Heart className="h-10 w-10 text-coral" /></div>
          <p className="mt-6 font-display text-xl font-bold text-forest">Nothing saved yet</p>
          <p className="mt-2 text-sage">Tap the heart on anything you love and it will wait for you here.</p>
          <Link href="/collection" className="btn-primary mt-8">Find something soft</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {visible.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
