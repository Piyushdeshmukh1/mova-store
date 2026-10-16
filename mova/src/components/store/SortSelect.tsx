"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { v: "featured", l: "Featured" }, { v: "newest", l: "Newest" }, { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" }, { v: "rating", l: "Top rated" },
];

export function SortSelect() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm text-sage">
      Sort
      <select value={sp.get("sort") || "featured"} onChange={(e) => {
        const n = new URLSearchParams(sp.toString());
        n.set("sort", e.target.value);
        router.push(`${path}?${n.toString()}`, { scroll: false });
      }} className="rounded-full border border-forest/15 bg-white px-4 py-2.5 font-medium text-forest focus:outline-none focus:ring-2 focus:ring-mint">
        {OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
