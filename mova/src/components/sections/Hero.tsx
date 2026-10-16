import Link from "next/link";
import { Check } from "lucide-react";
import { SmartImage } from "@/components/store/SmartImage";


type C = Record<string, any>;

export function Hero({ c }: { c: C }) {
  const lines: string[] = String(c.heading || "").split("\n").filter(Boolean);
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute -right-40 top-10 h-[640px] w-[640px] rounded-full bg-mint/50 blur-3xl" />
      <div className="container relative grid items-center gap-12 pb-16 pt-8 md:pt-12 lg:grid-cols-12 lg:gap-8 lg:pb-24">
        <div className="lg:col-span-7">
          {c.eyebrow && <p className="mb-6 animate-rise text-sm font-semibold text-sage">{c.eyebrow}</p>}
          <h1 className="text-display-xl uppercase">
            {lines.map((l, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <span className="block animate-rise" style={{ animationDelay: `${120 + i * 110}ms` }}>{l}</span>
              </span>
            ))}
          </h1>
          {c.subheading && (
            <p className="mt-7 max-w-[34ch] animate-rise text-lg leading-relaxed text-charcoal/75 md:text-xl" style={{ animationDelay: "380ms" }}>{c.subheading}</p>
          )}
          <div className="mt-9 flex animate-rise flex-wrap gap-3" style={{ animationDelay: "480ms" }}>
            {c.primaryLabel && <Link href={c.primaryUrl || "/collection"} className="btn-primary">{c.primaryLabel}</Link>}
            {c.secondaryLabel && <Link href={c.secondaryUrl || "/"} className="btn-coral">{c.secondaryLabel}</Link>}
          </div>
          {Array.isArray(c.highlights) && c.highlights.length > 0 && (
            <ul className="mt-10 flex animate-rise flex-wrap gap-x-6 gap-y-2 text-sm text-charcoal/70" style={{ animationDelay: "580ms" }}>
              {c.highlights.map((h: C, i: number) => (
                <li key={i} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-mint"><Check className="h-3 w-3 text-forest" strokeWidth={3} /></span>{h.text}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative lg:col-span-5">
          <div className="fold relative aspect-[4/5] animate-reveal overflow-hidden bg-mint-200 shadow-[0_40px_80px_-40px_rgba(18,60,53,.55)]">
            <SmartImage src={c.image} alt="" eager className="h-full w-full scale-105 transition duration-[2s]" />
          </div>
          {c.secondaryImage && (
            <div className="absolute -bottom-8 -left-4 w-40 animate-float overflow-hidden rounded-[1.5rem] border-[6px] border-cream bg-cream shadow-xl sm:-left-10 sm:w-48">
              <SmartImage src={c.secondaryImage} alt="" className="aspect-square w-full" />
            </div>
          )}
          {c.badgeText && (
            <div className="absolute -right-2 -top-6 h-32 w-32 sm:-right-6 sm:h-36 sm:w-36" aria-hidden>
              <svg viewBox="0 0 200 200" className="h-full w-full animate-[spin_24s_linear_infinite]">
                <defs><path id="hero-circle" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" /></defs>
                <circle cx="100" cy="100" r="98" fill="#FF8066" />
                <text className="fill-charcoal font-display" fontSize="17" fontWeight="800" letterSpacing="4">
                  <textPath href="#hero-circle" textLength="448" lengthAdjust="spacingAndGlyphs">{`${c.badgeText} • ${c.badgeText} • `}</textPath>
                </text>
              </svg>
              <span className="absolute inset-0 grid place-items-center">
                <span className="h-10 w-10 rounded-full bg-forest" />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
