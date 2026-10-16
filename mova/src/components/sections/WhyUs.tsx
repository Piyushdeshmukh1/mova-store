import { CmsIcon } from "@/components/store/Icon";
import { Reveal } from "@/components/store/Reveal";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";


type C = Record<string, any>;
const TONES = ["bg-mint-200", "bg-coral-100", "bg-cream-300", "bg-forest text-cream"];

export function WhyUs({ c }: { c: C }) {
  const cards: C[] = c.cards || [];
  return (
    <section className="section pt-0">
      <div className="container">
        <SectionHeading heading={c.heading} sub={c.subheading} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const dark = i % 4 === 3;
            return (
              <Reveal key={i} delay={i * 90}>
                <div className={cn("group flex h-full min-h-[260px] flex-col justify-between rounded-[2rem] p-7 transition duration-500 hover:-translate-y-1.5", TONES[i % 4])}>
                  <span className={cn("grid h-14 w-14 place-items-center rounded-full transition duration-500 group-hover:scale-110",
                    dark ? "bg-mint text-forest" : "bg-white text-forest")}>
                    <CmsIcon name={card.icon} className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className={cn("font-display text-2xl font-extrabold uppercase leading-tight tracking-tight", dark && "text-cream")}>{card.title}</h3>
                    <p className={cn("mt-2 text-[15px]", dark ? "text-cream/70" : "text-charcoal/70")}>{card.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
