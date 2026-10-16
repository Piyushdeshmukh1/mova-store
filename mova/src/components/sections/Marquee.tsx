import { cn } from "@/lib/utils";


export function Marquee({ c }: { c: Record<string, any> }) {
  const items: string[] = (c.items || []).map((i: { text: string }) => i.text).filter(Boolean);
  if (!items.length) return null;
  const theme = c.theme === "forest" ? "bg-forest text-cream" : c.theme === "coral" ? "bg-coral text-charcoal" : "bg-mint text-forest";
  const row = [...items, ...items, ...items];
  return (
    <div className={cn("overflow-hidden py-5", theme)} aria-label={items.join(", ")}>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap motion-reduce:animate-none" aria-hidden>
        {[...row, ...row].map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
            {t}
            <svg width="22" height="22" viewBox="0 0 24 24" className="opacity-70"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill="currentColor" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}
