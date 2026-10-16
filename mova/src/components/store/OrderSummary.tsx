import { Check } from "lucide-react";
import type { orders, orderItems } from "@/db/schema";
import { cn, formatDate, formatINR } from "@/lib/utils";
import { SHIP_STEPS, shipIndex } from "@/lib/order-view";
import { SmartImage } from "./SmartImage";

type O = typeof orders.$inferSelect & { items: (typeof orderItems.$inferSelect)[] };

export function OrderSummary({ o }: { o: O }) {
  const idx = shipIndex(o.shippingStatus);
  const cancelled = o.orderStatus === "cancelled";
  const a = o.shippingAddress;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-[2rem] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl uppercase">Order {o.orderNumber}</h2>
            <span className="text-sm text-sage">Placed {formatDate(o.createdAt)}</span>
          </div>
          {cancelled ? (
            <p className="mt-6 rounded-2xl bg-coral-100 p-4 text-sm font-semibold text-coral-600">This order was cancelled.</p>
          ) : (
            <ol className="mt-8 grid grid-cols-5 gap-1">
              {SHIP_STEPS.map((s, i) => (
                <li key={s.key} className="flex flex-col items-center text-center">
                  <div className="flex w-full items-center">
                    <span className={cn("h-0.5 flex-1", i === 0 ? "opacity-0" : i <= idx ? "bg-forest" : "bg-cream-300")} />
                    <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold", i <= idx ? "bg-forest text-cream" : "bg-cream-200 text-sage")}>
                      {i <= idx ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={cn("h-0.5 flex-1", i === SHIP_STEPS.length - 1 ? "opacity-0" : i < idx ? "bg-forest" : "bg-cream-300")} />
                  </div>
                  <span className={cn("mt-2 text-[11px] font-semibold leading-tight md:text-xs", i <= idx ? "text-forest" : "text-sage")}>{s.label}</span>
                </li>
              ))}
            </ol>
          )}
          {o.trackingNumber && (
            <p className="mt-6 text-sm text-charcoal/80">Tracking: <strong className="text-forest">{o.courier ? `${o.courier} · ` : ""}{o.trackingNumber}</strong></p>
          )}
        </div>
        <div className="rounded-[2rem] bg-white p-6 md:p-8">
          <h3 className="text-lg uppercase">Items</h3>
          <ul className="mt-4 divide-y divide-forest/10">
            {o.items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-cream-200"><SmartImage src={it.image} alt="" className="h-full w-full" /></div>
                <div className="flex-1">
                  <p className="font-semibold text-forest">{it.name}</p>
                  <p className="text-xs text-sage">{[it.variantLabel, `Qty ${it.quantity}`].filter(Boolean).join(" · ")}</p>
                </div>
                <p className="font-semibold">{formatINR(it.unitPrice * it.quantity)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <aside className="h-fit space-y-6">
        <div className="rounded-[2rem] bg-forest p-6 text-cream md:p-8">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-cream/70">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-mint"><dt>Discount {o.couponCode}</dt><dd>– {formatINR(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-cream/70">Shipping</dt><dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd></div>
            {o.codFee > 0 && <div className="flex justify-between"><dt className="text-cream/70">COD fee</dt><dd>{formatINR(o.codFee)}</dd></div>}
            <div className="flex items-baseline justify-between border-t border-cream/15 pt-3"><dt className="font-semibold">Total</dt><dd className="font-display text-2xl font-extrabold">{formatINR(o.total)}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-cream/70">
            {o.paymentMethod === "cod" ? "Cash on Delivery" : "Paid online"} · Payment {o.paymentStatus}
          </p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 text-sm md:p-8">
          <h3 className="text-base uppercase">Delivering to</h3>
          <p className="mt-3 leading-relaxed text-charcoal/80">
            {o.name}<br />{a.line1}{a.line2 ? <>, {a.line2}</> : null}<br />{a.landmark ? <>{a.landmark}<br /></> : null}{a.city}, {a.state} {a.pincode}<br />{o.phone}
          </p>
        </div>
      </aside>
    </div>
  );
}
