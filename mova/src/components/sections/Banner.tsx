import Link from "next/link";
import { SmartImage } from "@/components/store/SmartImage";
import { Reveal } from "@/components/store/Reveal";
import { cn } from "@/lib/utils";


export function Banner({ c }: { c: Record<string, any> }) {
  const theme = c.theme === "forest" ? "bg-forest text-cream" : c.theme === "mint" ? "bg-mint text-forest" : "bg-coral text-charcoal";
  const dark = c.theme === "forest";
  return (
    <section className="container pb-20 md:pb-28">
      <Reveal className={cn("relative grid overflow-hidden rounded-[2.5rem] md:grid-cols-2", theme)}>
        <div className="relative z-10 p-8 sm:p-12 lg:p-16">
          <h2 className={cn("text-display-md uppercase", dark ? "text-cream" : "text-forest")}>{c.heading}</h2>
          {c.text && <p className={cn("mt-5 max-w-md text-lg", dark ? "text-cream/75" : "text-charcoal/80")}>{c.text}</p>}
          {c.code && (
            <p className="mt-6 inline-flex items-center gap-3 rounded-full border-2 border-dashed border-current/40 px-5 py-2.5 text-sm">
              Use code <strong className="font-display text-base tracking-wider">{c.code}</strong>
            </p>
          )}
          {c.buttonLabel && (
            <div className="mt-8"><Link href={c.buttonUrl || "/collection"} className={dark ? "btn-coral" : "btn-primary"}>{c.buttonLabel}</Link></div>
          )}
        </div>
        {c.image && (
          <div className="relative min-h-[260px] md:min-h-full">
            <SmartImage src={c.image} alt="" className="absolute inset-0 h-full w-full" />
          </div>
        )}
      </Reveal>
    </section>
  );
}
