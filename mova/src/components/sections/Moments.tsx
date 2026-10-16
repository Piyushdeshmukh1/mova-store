import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SmartImage } from "@/components/store/SmartImage";
import { Reveal } from "@/components/store/Reveal";
import { SectionHeading } from "./SectionHeading";


type C = Record<string, any>;

export function Moments({ c }: { c: C }) {
  const cards: C[] = c.cards || [];
  return (
    <section className="section">
      <div className="container">
        <SectionHeading heading={c.heading} sub={c.subheading} />
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-5">
          {cards.map((card, i) => (
            <Reveal key={i} delay={i * 90} className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto">
              <Link href={card.url || "/collection"} className={`group relative block overflow-hidden rounded-[2rem] ${i % 2 ? "lg:mt-12" : ""}`}>
                <div className="aspect-[3/4]">
                  <SmartImage src={card.image} alt={card.title} className="h-full w-full transition duration-700 ease-out group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6">
                  <div>
                    <p className="text-sm font-medium text-mint">{card.subtitle}</p>
                    <h3 className="mt-1 font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-cream">{card.title}</h3>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream text-forest transition duration-300 group-hover:rotate-45 group-hover:bg-coral">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
