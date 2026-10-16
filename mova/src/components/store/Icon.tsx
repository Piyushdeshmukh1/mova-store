import { Feather, Droplets, Backpack, Shield, Sparkles, Wind, Leaf, Heart, Zap, Sun, Timer, Waves, type LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = { feather: Feather, droplets: Droplets, backpack: Backpack, shield: Shield, sparkles: Sparkles, wind: Wind, leaf: Leaf, heart: Heart, zap: Zap, sun: Sun, timer: Timer, waves: Waves };

export function CmsIcon({ name, className }: { name?: string; className?: string }) {
  const I = MAP[name || ""] || Sparkles;
  return <I className={className} strokeWidth={1.6} aria-hidden />;
}
