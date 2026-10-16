import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { findOrderForShopper } from "@/lib/order-view";
import { OrderSummary } from "@/components/store/OrderSummary";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return { ...(await buildMetadata({ title: "Your order", path: "/order" })), robots: { index: false } };
}

export default async function OrderPage({ params, searchParams }: { params: { number: string }; searchParams: { email?: string; new?: string } }) {
  const session = await getCustomer();
  const email = searchParams.email || session?.email || "";
  const o = await findOrderForShopper(params.number, email);
  if (!o) notFound();
  const isNew = searchParams.new === "1";
  return (
    <section className="container pb-24 pt-8 md:pt-12">
      {isNew ? (
        <div className="mb-10 animate-rise">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-600">Thank you, {o.name.split(" ")[0]}</p>
          <h1 className="mt-3 text-display-lg uppercase">
            {o.paymentStatus === "paid" || o.paymentMethod === "cod" ? "Your order is confirmed." : "We've got your order."}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-charcoal/70">Your order number is <strong className="text-forest">{o.orderNumber}</strong>. Save it — you can check your order status anytime on the Track Order page using this number and {o.email}.</p>
        </div>
      ) : (
        <h1 className="mb-10 text-display-lg uppercase">Order details</h1>
      )}
      <OrderSummary o={o} />
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/collection" className="btn-primary">Keep shopping</Link>
        <Link href="/track" className="btn-ghost">Track another order</Link>
      </div>
    </section>
  );
}
