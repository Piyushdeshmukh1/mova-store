import Link from "next/link";
import { SmartImage } from "@/components/store/SmartImage";
import { Reveal } from "@/components/store/Reveal";


type C = Record<string, any>;

export function Story({ c }: { c: C }) {
  const paras = String(c.body || "").split(/\n\s*\n/).filter(Boolean);
  const stats: C[] = c.stats || [];
  return (
    <section className="section overflow-hidden">
      <div className="container grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal className="relative order-2 lg:order-1">
          <div className="fold-sm aspect-[4/5] max-w-[520px] overflow-hidden bg-mint-200">
            <SmartImage src={c.image} alt="" className="h-full w-full" />
          </div>
          {c.secondaryImage && (
            <div className="absolute -right-2 bottom-10 w-[42%] overflow-hidden rounded-[2rem] border-8 border-cream shadow-2xl sm:right-4 lg:-right-10">
              <SmartImage src={c.secondaryImage} alt="" className="aspect-square w-full" />
            </div>
          )}
        </Reveal>
        <div className="order-1 lg:order-2">
          <Reveal><h2 className="text-display-lg uppercase">{c.heading}</h2></Reveal>
          <Reveal delay={100} className="mt-8 space-y-5 text-lg leading-[1.7] text-charcoal/75">
            {paras.map((p, i) => <p key={i}>{p}</p>)}
          </Reveal>
          {stats.length > 0 && (
            <Reveal delay={180} className="mt-10 grid grid-cols-3 gap-4 border-y border-forest/10 py-7">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="font-display text-3xl font-extrabold tracking-tight text-forest md:text-4xl">{s.value}</p>
                  <p className="mt-1 text-sm text-sage">{s.label}</p>
                </div>
              ))}
            </Reveal>
          )}
          {c.buttonLabel && <Reveal delay={240}><Link href={c.buttonUrl || "/our-story"} className="btn-primary mt-10">{c.buttonLabel}</Link></Reveal>}
        </div>
      </div>
    </section>
  );
}
