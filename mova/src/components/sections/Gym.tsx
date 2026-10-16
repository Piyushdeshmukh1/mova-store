import Link from "next/link";
import { productsFromSource } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { SmartImage } from "@/components/store/SmartImage";
import { Reveal } from "@/components/store/Reveal";
import { CmsIcon } from "@/components/store/Icon";


type C = Record<string, any>;

export async function Gym({ c }: { c: C }) {
  const items = await productsFromSource(c.source || "cat:gym-towels", Number(c.limit) || 3);
  const features: C[] = c.features || [];
  const tape = features.map((f) => f.title).filter(Boolean);
  return (
    <section className="relative overflow-hidden bg-forest text-cream">
      {tape.length > 0 && (
        <div className="-rotate-2 scale-105 bg-coral py-3 text-charcoal" aria-hidden>
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap motion-reduce:animate-none">
            {Array.from({ length: 8 }).flatMap((_, k) => tape.map((t, i) => (
              <span key={`${k}-${i}`} className="font-display text-lg font-extrabold uppercase tracking-tight">{t} <span className="px-3">✦</span></span>
            )))}
          </div>
        </div>
      )}
      <div className="container section">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal className="relative">
            <div className="fold aspect-[5/6] overflow-hidden bg-forest-600">
              <SmartImage src={c.image} alt="" className="h-full w-full grayscale-[15%] transition duration-700 hover:scale-105" />
            </div>
            {c.stickerText && (
              <div className="absolute -bottom-6 right-6 rounded-full bg-mint px-6 py-4 font-display text-sm font-extrabold uppercase tracking-wide text-forest shadow-xl md:right-10">
                {c.stickerText}
              </div>
            )}
          </Reveal>

          <div>
            <Reveal>
              <h2 className="text-display-lg uppercase text-cream">{c.heading}</h2>
              {c.subheading && <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/70">{c.subheading}</p>}
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div className="group h-full rounded-[1.5rem] border border-cream/10 bg-cream/[0.04] p-5 transition hover:border-mint/40 hover:bg-cream/[0.08]">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-forest transition group-hover:-rotate-6 group-hover:bg-coral">
                      <CmsIcon name={f.icon} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-extrabold uppercase tracking-tight text-cream">{f.title}</h3>
                    {f.text && <p className="mt-1 text-sm text-cream/60">{f.text}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
            {c.ctaLabel && (
              <Reveal delay={200}><Link href={c.ctaUrl || "/c/gym-towels"} className="btn-coral mt-10">{c.ctaLabel}</Link></Reveal>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-24 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3">
            {items.map((p, i) => <Reveal key={p.id} delay={i * 80} className={i === 2 ? "col-span-2 mx-auto w-1/2 min-w-[240px] lg:col-span-1 lg:mx-0 lg:w-full lg:min-w-0" : ""}><ProductCard p={p} tone="dark" /></Reveal>)}
          </div>
        )}
      </div>
    </section>
  );
}
