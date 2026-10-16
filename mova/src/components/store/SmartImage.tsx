"use client";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

/** <img> with lazy loading and a branded fallback if the URL fails. Works with any CMS URL. */
export function SmartImage({ src, alt, className, eager, sizes }: { src?: string | null; alt: string; className?: string; eager?: boolean; sizes?: string }) {
  const [failed, setFailed] = useState(false);
  // If the image already failed before React hydrated, onError never fires — check on mount.
  const ref = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center bg-gradient-to-br from-mint-200 via-cream-200 to-mint", className)} role="img" aria-label={alt}>
        <svg viewBox="0 0 64 64" className="h-1/4 w-1/4 max-h-16 max-w-16 text-forest/25" fill="currentColor" aria-hidden>
          <rect x="8" y="30" width="48" height="12" rx="6" /><rect x="12" y="20" width="40" height="11" rx="5.5" opacity=".7" />
        </svg>
      </div>
    );
  }
  return (
    <img
      ref={ref}
      key={src}
      src={src}
      alt={alt}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : undefined}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
