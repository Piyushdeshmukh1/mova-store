import { cn } from "@/lib/utils";
import { Reveal } from "@/components/store/Reveal";

export function SectionHeading({ heading, sub, light, className, children }: { heading?: string; sub?: string; light?: boolean; className?: string; children?: React.ReactNode }) {
  if (!heading && !sub) return null;
  return (
    <Reveal className={cn("mb-12 flex flex-col gap-5 md:mb-16 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        {heading && <h2 className={cn("max-w-[18ch] text-display-lg uppercase", light && "text-cream")}>{heading}</h2>}
      </div>
      <div className="flex flex-col items-start gap-5 md:max-w-sm md:items-end md:text-right">
        {sub && <p className={cn("text-lg leading-relaxed", light ? "text-cream/70" : "text-charcoal/70")}>{sub}</p>}
        {children}
      </div>
    </Reveal>
  );
}
