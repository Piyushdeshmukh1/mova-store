import Link from "next/link";
import { SmartImage } from "./SmartImage";

export function PageHero({ title, subtitle, image, crumbs }: { title: string; subtitle?: string | null; image?: string | null; crumbs?: { name: string; path: string }[] }) {
  return (
    <section className="container pb-10 pt-8 md:pb-14 md:pt-12">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-sage">
          <ol className="flex flex-wrap items-center gap-2">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i < crumbs.length - 1 ? <Link href={c.path} className="hover:text-forest">{c.name}</Link> : <span aria-current="page" className="text-forest">{c.name}</span>}
                {i < crumbs.length - 1 && <span aria-hidden>/</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className={image ? "grid items-end gap-10 md:grid-cols-[1.4fr_1fr]" : ""}>
        <div>
          <h1 className="animate-rise text-display-lg uppercase">{title}</h1>
          {subtitle && <p className="mt-5 max-w-xl animate-rise text-lg leading-relaxed text-charcoal/70" style={{ animationDelay: "120ms" }}>{subtitle}</p>}
        </div>
        {image && (
          <div className="fold-sm hidden aspect-[4/3] animate-reveal overflow-hidden bg-mint-200 md:block">
            <SmartImage src={image} alt="" eager className="h-full w-full" />
          </div>
        )}
      </div>
    </section>
  );
}
