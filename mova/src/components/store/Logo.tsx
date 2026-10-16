import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ brand, logoUrl, className, light }: { brand: string; logoUrl?: string; className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex animate-rise items-center", className)} aria-label={`${brand} home`}>
      {logoUrl ? (
        <img src={logoUrl} alt={brand} className={cn("h-10 w-auto origin-center object-contain transition-transform duration-300 group-hover:animate-wiggle md:h-12", light && "brightness-0 invert")} />
      ) : (
        <span className={cn("font-display text-[26px] font-extrabold leading-none tracking-[-0.06em] md:text-[30px]", light ? "text-cream" : "text-forest")}>
          {brand}<span className="inline-block animate-pulse text-coral">.</span>
        </span>
      )}
    </Link>
  );
}
