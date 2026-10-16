import { findOrderForShopper } from "@/lib/order-view";
import { OrderSummary } from "@/components/store/OrderSummary";
import { PageHero } from "@/components/store/PageHero";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({ title: "Track your order", description: "Check the status of your order.", path: "/track" });
}

export default async function TrackPage({ searchParams }: { searchParams: { order?: string; email?: string } }) {
  const tried = !!(searchParams.order && searchParams.email);
  const o = tried ? await findOrderForShopper(searchParams.order!, searchParams.email!) : null;
  return (
    <>
      <PageHero title="Track your order" subtitle="Enter your order number and the email you used at checkout." crumbs={[{ name: "Home", path: "/" }, { name: "Track order", path: "/track" }]} />
      <section className="container pb-24">
        <form className="grid max-w-3xl gap-3 rounded-[2rem] bg-white p-5 md:grid-cols-[1fr_1fr_auto] md:p-6" method="get">
          <div><label htmlFor="order" className="label">Order number</label><input id="order" name="order" defaultValue={searchParams.order} placeholder="MV…" className="input uppercase" required /></div>
          <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" defaultValue={searchParams.email} className="input" required /></div>
          <button className="btn-primary self-end">Track</button>
        </form>
        {tried && !o && <p className="mt-6 text-coral-600" role="alert">We couldn&apos;t find an order with those details. Please double-check and try again.</p>}
        {o && <div className="mt-12"><OrderSummary o={o} /></div>}
      </section>
    </>
  );
}
