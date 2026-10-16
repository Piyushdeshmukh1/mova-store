"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Banknote, Lock, ShieldCheck, Smartphone, Truck } from "lucide-react";
import { useCart } from "@/lib/store";
import { cn, formatINR } from "@/lib/utils";
import { INDIAN_STATES } from "@/lib/validation";
import { SmartImage } from "./SmartImage";
import { usePricedCart } from "./usePricedCart";

type RzpOptions = Record<string, unknown> & { handler?: (r: Record<string, string>) => void; modal?: { ondismiss?: () => void } };
declare global { interface Window { Razorpay?: new (o: RzpOptions) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void } } }

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Props = { prefill: { name: string; email: string; phone: string }; codEnabled: boolean; codFee: number; onlineAvailable: boolean; testMode: boolean; delivery: string };

export function CheckoutView({ prefill, codEnabled, codFee, onlineAvailable, testMode, delivery }: Props) {
  const router = useRouter();
  const { items, couponCode, clear } = useCart();
  const [method, setMethod] = useState<"razorpay" | "cod">(onlineAvailable ? "razorpay" : "cod");
  const { data, loading, hydrated } = usePricedCart(method);
  const [f, setF] = useState({ ...prefill, line1: "", line2: "", landmark: "", city: "", state: "", pincode: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (hydrated && !items.length && !busy) router.replace("/cart"); }, [hydrated, items.length, busy, router]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const done = (orderNumber: string) => { clear(); router.push(`/order/${orderNumber}?email=${encodeURIComponent(f.email.trim().toLowerCase())}&new=1`); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setErrors({});
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
          couponCode: couponCode || null, paymentMethod: method, notes: f.notes,
          customer: { name: f.name, email: f.email, phone: f.phone },
          address: { line1: f.line1, line2: f.line2, landmark: f.landmark, city: f.city, state: f.state, pincode: f.pincode },
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        const fe: Record<string, string> = {};
        for (const [k, v] of Object.entries((d.fields ?? {}) as Record<string, string[]>)) if (v?.[0]) fe[k] = v[0];
        setErrors(fe); setError(d.error ?? "Something went wrong."); setBusy(false); return;
      }
      if (d.mode === "cod") return done(d.orderNumber);
      if (d.mode === "mock") {
        const r = await fetch("/api/payments/mock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: d.orderId }) });
        if (r.ok) return done(d.orderNumber);
        setError("Test payment failed."); setBusy(false); return;
      }
      if (!(await loadRazorpay()) || !window.Razorpay) { setError("Couldn't load the payment window. Check your connection and try again."); setBusy(false); return; }
      const rzp = new window.Razorpay({
        ...d.razorpay,
        handler: async (resp: Record<string, string>) => {
          const v = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
          if (v.ok) done(d.orderNumber);
          else { setError("We couldn't verify your payment. If money was deducted, it will be auto-refunded or your order confirmed shortly."); setBusy(false); }
        },
        modal: { ondismiss: () => { setBusy(false); setError("Payment was cancelled. Your bag is still here."); } },
      });
      rzp.on("payment.failed", () => { setBusy(false); setError("Payment failed. Please try another method."); });
      rzp.open();
    } catch {
      setError("Network error. Please try again."); setBusy(false);
    }
  }

  if (!hydrated || !items.length) return <div className="container min-h-[60vh] py-16" />;

  const Field = ({ k, label, type = "text", auto, className, ...rest }: { k: keyof typeof f; label: string; type?: string; auto?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) => {
    const errKey = k === "name" || k === "email" || k === "phone" ? k : k;
    return (
      <div className={className}>
        <label htmlFor={k} className="label">{label}</label>
        <input id={k} name={k} type={type} autoComplete={auto} value={f[k]} onChange={set(k)} className={cn("input", errors[errKey] && "border-coral")} {...rest} />
      </div>
    );
  };

  return (
    <section className="container pb-24 pt-8 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-display-lg uppercase">Checkout</h1>
        <p className="flex items-center gap-2 text-sm text-sage"><Lock className="h-4 w-4" /> Secure, encrypted checkout</p>
      </div>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]" noValidate>
        <div className="space-y-8">
          <fieldset className="rounded-[2rem] bg-white p-6 md:p-8">
            <legend className="float-left mb-6 font-display text-xl font-extrabold uppercase text-forest">1. Your details</legend>
            <div className="clear-both grid gap-4 md:grid-cols-2">
              {Field({ k: "name", label: "Full name", auto: "name", className: "md:col-span-2", required: true })}
              {Field({ k: "email", label: "Email", type: "email", auto: "email", required: true })}
              {Field({ k: "phone", label: "Mobile number", type: "tel", auto: "tel", inputMode: "tel", placeholder: "10-digit mobile", required: true })}
            </div>
          </fieldset>

          <fieldset className="rounded-[2rem] bg-white p-6 md:p-8">
            <legend className="float-left mb-6 font-display text-xl font-extrabold uppercase text-forest">2. Delivery address</legend>
            <div className="clear-both grid gap-4 md:grid-cols-2">
              {Field({ k: "line1", label: "House no., building, street", auto: "address-line1", className: "md:col-span-2", required: true })}
              {Field({ k: "line2", label: "Area, locality (optional)", auto: "address-line2", className: "md:col-span-2" })}
              {Field({ k: "landmark", label: "Landmark (optional)" })}
              {Field({ k: "pincode", label: "PIN code", auto: "postal-code", inputMode: "numeric", maxLength: 6, required: true })}
              {Field({ k: "city", label: "City", auto: "address-level2", required: true })}
              <div>
                <label htmlFor="state" className="label">State</label>
                <select id="state" value={f.state} onChange={set("state")} autoComplete="address-level1" className="input" required>
                  <option value="">Choose state</option>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="label">Delivery notes (optional)</label>
                <textarea id="notes" value={f.notes} onChange={set("notes")} rows={2} className="input" maxLength={300} />
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-sage"><Truck className="h-4 w-4" />{delivery}</p>
          </fieldset>

          <fieldset className="rounded-[2rem] bg-white p-6 md:p-8">
            <legend className="float-left mb-6 font-display text-xl font-extrabold uppercase text-forest">3. Payment</legend>
            <div className="clear-both grid gap-3">
              {onlineAvailable && (
                <PayOption active={method === "razorpay"} onClick={() => setMethod("razorpay")} icon={<Smartphone className="h-5 w-5" />}
                  title="Pay online" text={testMode ? "Test mode: payment is simulated (no Razorpay keys configured)." : "UPI, cards, NetBanking & wallets via Razorpay"} />
              )}
              {codEnabled && (
                <PayOption active={method === "cod"} onClick={() => setMethod("cod")} icon={<Banknote className="h-5 w-5" />}
                  title="Cash on Delivery" text={codFee ? `A ${formatINR(codFee)} COD handling fee applies.` : "Pay when your order arrives."} />
              )}
              {!onlineAvailable && !codEnabled && <p className="text-sm text-coral-600">Checkout is temporarily unavailable. Please contact us.</p>}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-[2rem] bg-forest p-6 text-cream md:p-8 lg:sticky lg:top-28">
          <h2 className="text-xl uppercase text-cream">Order summary</h2>
          <ul className="mt-6 max-h-72 space-y-4 overflow-y-auto pr-1">
            {items.map((i) => {
              const l = data?.lines.find((x) => x.productId === i.productId && x.variantId === i.variantId);
              return (
                <li key={i.key} className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream">
                    <SmartImage src={i.image} alt="" className="h-full w-full" />
                    <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-coral px-1 text-[11px] font-bold text-charcoal">{i.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.name}</p>
                    {i.variantLabel && <p className="text-xs text-cream/60">{i.variantLabel}</p>}
                  </div>
                  <p className="font-semibold">{formatINR((l?.unitPrice ?? i.price) * i.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <dl className={cn("mt-6 space-y-2.5 border-t border-cream/15 pt-5 text-sm transition-opacity", loading && "opacity-50")}>
            <div className="flex justify-between"><dt className="text-cream/70">Subtotal</dt><dd>{formatINR(data?.subtotal ?? 0)}</dd></div>
            {!!data?.discount && <div className="flex justify-between text-mint"><dt>Coupon {data.couponCode}</dt><dd>– {formatINR(data.discount)}</dd></div>}
            {couponCode && data?.couponError && <p className="text-xs text-coral">{couponCode}: {data.couponError}</p>}
            <div className="flex justify-between"><dt className="text-cream/70">Shipping</dt><dd>{data?.shipping ? formatINR(data.shipping) : "Free"}</dd></div>
            {!!data?.codFee && <div className="flex justify-between"><dt className="text-cream/70">COD fee</dt><dd>{formatINR(data.codFee)}</dd></div>}
            <div className="flex items-baseline justify-between border-t border-cream/15 pt-4">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-3xl font-extrabold">{formatINR(data?.total ?? 0)}</dd>
            </div>
          </dl>
          {(error || !!data?.errors?.length) && (
            <div className="mt-5 rounded-2xl bg-coral/20 p-3 text-sm text-cream" role="alert">
              {error || data?.errors[0]}
            </div>
          )}
          <button disabled={busy || loading || !!data?.errors?.length || (!onlineAvailable && !codEnabled)} className="btn-coral mt-6 w-full">
            {busy ? "Processing…" : method === "cod" ? "Place order" : `Pay ${formatINR(data?.total ?? 0)}`}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-cream/60"><ShieldCheck className="h-4 w-4" /> By placing the order you agree to our <Link href="/terms" className="underline">terms</Link>.</p>
        </aside>
      </form>
    </section>
  );
}

function PayOption({ active, onClick, icon, title, text }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; text: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition", active ? "border-forest bg-mint-200/60" : "border-cream-300 hover:border-sage")}>
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", active ? "bg-forest text-cream" : "bg-cream-200 text-forest")}>{icon}</span>
      <span>
        <span className="block font-display font-bold text-forest">{title}</span>
        <span className="block text-sm text-sage">{text}</span>
      </span>
      <span className={cn("ml-auto mt-1 h-5 w-5 shrink-0 rounded-full border-2", active ? "border-[6px] border-forest" : "border-sage-200")} />
    </button>
  );
}
