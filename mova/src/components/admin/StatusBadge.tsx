import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  paid: "bg-mint text-forest", delivered: "bg-mint text-forest", completed: "bg-mint text-forest", confirmed: "bg-mint-200 text-forest",
  pending: "bg-cream-300 text-charcoal", unfulfilled: "bg-cream-300 text-charcoal", processing: "bg-mint-200 text-forest",
  packed: "bg-mint-200 text-forest", shipped: "bg-forest text-cream", in_transit: "bg-forest text-cream",
  failed: "bg-coral text-charcoal", cancelled: "bg-coral-100 text-coral-600", refunded: "bg-coral-100 text-coral-600", returned: "bg-coral-100 text-coral-600",
};

export function StatusBadge({ value }: { kind?: "payment" | "order" | "shipping"; value: string }) {
  return <span className={cn("badge", TONES[value] ?? "bg-cream-300 text-charcoal")}>{value.replace("_", " ")}</span>;
}
