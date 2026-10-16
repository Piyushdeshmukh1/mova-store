import { Instagram, Quote } from "lucide-react";
import type { Testimonial } from "@/db/schema";
import { getTestimonials } from "@/lib/cms";
import { SmartImage } from "@/components/store/SmartImage";
import { Stars } from "@/components/store/Stars";
import { Reveal } from "@/components/store/Reveal";
import { SectionHeading } from "./SectionHeading";


type C = Record<string, any>;

function ReviewCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-[2rem] bg-white p-7 shadow-[0_1px_0_rgba(18,60,53,.06)]">
      <Quote className="h-8 w-8 fill-mint text-mint" />
      <Stars value={t.rating} className="mt-4" />
      <blockquote className="mt-4 flex-1 font-display text-xl font-semibold leading-snug tracking-tight text-forest">&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <SmartImage src={t.avatarUrl} alt="" className="h-11 w-11 rounded-full" />
        <div>
          <p className="text-sm font-semibold text-charcoal">{t.name}</p>
          <p className="text-xs text-sage">{[t.location, t.productName].filter(Boolean).join(", ")}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function PhotoCard({ t, tall }: { t: Testimonial; tall?: boolean }) {
  const Wrapper = t.link ? "a" : "div";
  return (
    <Wrapper {...(t.link ? { href: t.link, target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group relative block overflow-hidden rounded-[2rem] bg-cream-200">
      <SmartImage src={t.imageUrl} alt={t.quote || t.name} className={`w-full transition duration-700 group-hover:scale-105 ${tall ? "aspect-[3/4]" : "aspect-square"}`} />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-charcoal/75 via-transparent to-transparent p-5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        {t.quote && <p className="text-sm font-medium text-cream">{t.quote}</p>}
        <p className="mt-1 flex items-center gap-1.5 text-xs text-cream/80">
          {t.kind === "instagram" && <Instagram className="h-3.5 w-3.5" />}{t.handle || t.name}
        </p>
      </div>
      {t.kind === "instagram" && (
        <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-forest"><Instagram className="h-4 w-4" /></span>
      )}
    </Wrapper>
  );
}

export async function Social({ c }: { c: C }) {
  const all = await getTestimonials();
  const reviews = all.filter((t) => t.kind === "review");
  const photos = all.filter((t) => t.kind !== "review" && t.imageUrl);
  if (!all.length) return null;
  return (
    <section id="caught-in-the-wild" className="section scroll-mt-24 bg-cream-200/60">
      <div className="container">
        <SectionHeading heading={c.heading} sub={c.subheading}>
          {c.handle && (
            <a href={c.handleUrl || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-forest hover:text-coral">
              <Instagram className="h-5 w-5" />{c.handle}
            </a>
          )}
        </SectionHeading>

        {reviews.length > 0 && (
          <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-4">
            {reviews.map((t, i) => (
              <Reveal key={t.id} delay={i * 70} className="w-[82%] shrink-0 snap-start sm:w-[48%] md:w-auto"><ReviewCard t={t} /></Reveal>
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <div className="mt-6 columns-2 gap-4 md:columns-3 lg:columns-5 [&>*]:mb-4">
            {photos.map((t, i) => (
              <Reveal key={t.id} delay={i * 60} className="break-inside-avoid"><PhotoCard t={t} tall={i % 3 === 0} /></Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
