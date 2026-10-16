import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, orders } from "@/db";
import { getCustomer } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { formatDate, formatINR } from "@/lib/utils";
import { AuthForms } from "@/components/store/AuthForms";
import { logoutAction } from "./actions";

export async function generateMetadata() {
  return { ...(await buildMetadata({ title: "My account", path: "/account" })), robots: { index: false } };
}

export default async function AccountPage() {
  const me = await getCustomer();
  if (!me) {
    return (
      <section className="container pb-24 pt-8 md:pt-12">
        <h1 className="text-display-lg uppercase">Hello again.</h1>
        <p className="mt-4 max-w-lg text-lg text-charcoal/70">Sign in to see your orders, or create an account. Checked out as a guest before? Register with the same email and your past orders will appear here.</p>
        <AuthForms />
      </section>
    );
  }
  const list = await db.query.orders.findMany({ where: eq(orders.customerId, Number(me.sub)), orderBy: desc(orders.createdAt), with: { items: true }, limit: 50 });
  return (
    <section className="container pb-24 pt-8 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg uppercase">Hi, {me.name?.split(" ")[0] || "there"}.</h1>
          <p className="mt-2 text-sage">{me.email}</p>
        </div>
        <form action={logoutAction}><button className="btn-ghost">Sign out</button></form>
      </div>
      <h2 className="mt-14 text-2xl uppercase">Your orders</h2>
      {list.length === 0 ? (
        <p className="mt-4 text-sage">No orders yet. <Link href="/collection" className="font-semibold text-forest underline">Start shopping</Link></p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {list.map((o) => (
            <li key={o.id}>
              <Link href={`/order/${o.orderNumber}`} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg md:p-6">
                <div>
                  <p className="font-display font-bold text-forest">{o.orderNumber}</p>
                  <p className="text-sm text-sage">{formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-mint-200 text-forest">{o.shippingStatus.replace("_", " ")}</span>
                  <span className="font-display text-lg font-extrabold text-forest">{formatINR(o.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
