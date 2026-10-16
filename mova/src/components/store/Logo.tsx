import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ brand, logoUrl, className, light }: { brand: string; logoUrl?: string; className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label={`${brand} home`}>
      {logoUrl ? (
        <img src={logoUrl} alt={brand} className="h-8 w-auto md:h-9" />
      ) : (
        <span className={cn("font-display text-[26px] font-extrabold leading-none tracking-[-0.06em] md:text-[30px]", light ? "text-cream" : "text-forest")}>
          {brand}<span className="text-coral">.</span>
        </span>
      )}
    </Link>
  );
}
