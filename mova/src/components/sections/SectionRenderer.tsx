import type { HomeSection } from "@/db/schema";
import { Hero } from "./Hero";
import { Marquee } from "./Marquee";
import { Moments } from "./Moments";
import { ProductGrid } from "./ProductGrid";
import { Gym } from "./Gym";
import { Story } from "./Story";
import { WhyUs } from "./WhyUs";
import { Banner } from "./Banner";
import { Social } from "./Social";
import { Newsletter } from "./Newsletter";


const MAP: Record<string, (p: { c: any }) => any> = {
  hero: Hero, marquee: Marquee, moments: Moments, featured: ProductGrid, gym: Gym,
  story: Story, whyus: WhyUs, banner: Banner, social: Social, newsletter: Newsletter,
};

export function SectionRenderer({ sections }: { sections: HomeSection[] }) {
  return (
    <>
      {sections.map((s) => {
        const Comp = MAP[s.type];
        return Comp ? <Comp key={s.id} c={s.content} /> : null;
      })}
    </>
  );
}
