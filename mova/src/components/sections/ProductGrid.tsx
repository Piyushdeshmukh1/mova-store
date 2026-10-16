import Link from "next/link";
import { productsFromSource } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { Reveal } from "@/components/store/Reveal";
import { SectionHeading } from "./SectionHeading";


export async function ProductGrid({ c }: { c: Record<string, any> }) {
  const items = await productsFromSource(c.source, Number(c.limit) || 4);
  if (!items.length) return null;
  return (
    <section className="section bg-white/60">
      <div className="container">
        <SectionHeading heading={c.heading} sub={c.subheading}>
          {c.ctaLabel && <Link href={c.ctaUrl || "/collection"} className="btn-ghost">{c.ctaLabel}</Link>}
        </SectionHeading>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}><ProductCard p={p} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
